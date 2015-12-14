////////////////////// VARS

var renderer, scene, camera, world, target, light, hblur, vblur, composer, copypass, car, popcorn, flash, water;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var SCALE = 0.75;
var lookPos = new THREE.Vector3( 0, 0, 0 );

////////////////////// SET UP SCENE

function init(){

    scene = new THREE.Scene();
    if(SCREEN_WIDTH > 1400){
        scene.fog = new THREE.FogExp2( 0xf5f8ca, 0.0030 );
    }
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

    flash = new THREE.PointLight( 0x990044, 0, 0 );
    flash.position.set( 0, 20, -220 );
    scene.add( flash );

    renderer = new THREE.WebGLRenderer( {antialias:true} );
    renderer.setClearColor( 0xcaf8f1 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    var renderModel = new THREE.RenderPass(scene, camera);
    copyPass = new THREE.ShaderPass(THREE.CopyShader);
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderModel);
    hblur = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader);
    vblur = new THREE.ShaderPass(THREE.VerticalTiltShiftShader);
    var bluriness = 4;

    hblur.uniforms['h'].value = bluriness / window.innerWidth;
    vblur.uniforms['v'].value = bluriness / window.innerHeight;
    hblur.uniforms['r'].value = vblur.uniforms['r'].value = 0.5;

    composer.addPass(hblur);
    composer.addPass(vblur);
    composer.addPass(copyPass);
    copyPass.renderToScreen = true;

    document.body.appendChild( renderer.domElement );


    var loader = new THREE.ObjectLoader();
    loader.load( 'js/scene.json', function ( object ) {
        object.traverse( function( node ) { 
            if ( node instanceof THREE.Mesh ) { 
                node.castShadow = true; 
                node.receiveShadow = true;
            } 
        });
        scene.add( object );
        world = scene.getObjectByName( "escene.dae", true );

        car = scene.getObjectByName( "car", true );         
        water = scene.getObjectByName( "Plane 1", true );
        light = scene.getObjectByName( "spot", true );
        light.castShadow = true;
        //light.shadowCameraVisible = true;
        light.shadowCameraNear = 5;
        light.shadowCameraFar = 700;
        light.shadowCameraFov = 90;

        light.shadowBias = 0.0005;
        if(SCREEN_WIDTH > 1400){
            light.shadowDarkness = .65;
        }else{
            light.shadowDarkness = .20;
        }

        light.shadowMapWidth = 2048;
        light.shadowMapHeight = 2048;
        light.shadowMapType = THREE.PCFSoftShadowMap;
        render();
    } );

    var particleTexture = THREE.ImageUtils.loadTexture( 'img/rain.png' );

    particleGroup = new THREE.Object3D();
    var totalParticles = 200;
    var radiusRange = 50;
    for( var i = 0; i < totalParticles; i++ ) {
        var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.position.set( Math.random() - 0.5, Math.random() - 0.2, Math.random() - 0.5 );
        sprite.position.multiplyScalar( radiusRange );
        particleGroup.add( sprite );
    }
    particleGroup.position.set (0, 10, -220);
    scene.add( particleGroup );

    camera.position.set( 0, 0, 110 );
}

//////////////////// DOC RESIZE

function onWindowResized( event ) {

    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.projectionMatrix.makePerspective( fov, window.innerWidth / window.innerHeight, 1, 1100 );
}

////////////////////// CAMERA MOVES

function camMove1(){
    var anim = new TWEEN.Tween( lookPos ).to( { x: 0, y: 0, z: 20 }, 2500 ).easing( TWEEN.Easing.Quartic.InOut).start();

    var anim2 = new TWEEN.Tween( camera.position ).to( { x: 0, y: 5, z: 50 }, 2500 ).easing( TWEEN.Easing.Quartic.InOut).start();
}
function camMove2(){
    var anim = new TWEEN.Tween( lookPos ).to( { x: 0, y: 9, z: -160 }, 2500 ).easing( TWEEN.Easing.Quartic.InOut).start();

    var anim2 = new TWEEN.Tween( camera.position ).to( { x: 0, y: 8, z: -110 }, 2500 ).easing( TWEEN.Easing.Quartic.InOut).start();
}
function camMove3(){
    var anim = new TWEEN.Tween( lookPos ).to( { x: 0, y: 9, z: -360 }, 2500 ).easing( TWEEN.Easing.Quartic.InOut).start();

    var anim2 = new TWEEN.Tween( camera.position ).to( { x: 0, y: 30, z: -310 }, 2500 ).easing( TWEEN.Easing.Quartic.InOut).start();
}
function camMove4(){
    var anim = new TWEEN.Tween( lookPos ).to( { x: -30, y: 40, z: -480 }, 2500 ).easing( TWEEN.Easing.Quartic.InOut).start();

    var anim2 = new TWEEN.Tween( camera.position ).to( { x: 0, y: 30, z: -420 }, 2500 ).easing( TWEEN.Easing.Quartic.InOut).start();
}

////////////////////// LIGHTING ANIMATION

function lightOn(){
    flash.intensity = 4;
}

function lightOff(){
    flash.intensity = 0;
}

////////////////////// DRAW/ANIMATE SCENE

function render () {
    requestAnimationFrame(render);
    camera.lookAt(lookPos);
    composer.render(0.01);
    TWEEN.update();
    var time = Date.now() * 0.0009;
    car.position.x += 0.2;
    if (car.position.x > 200) car.position.x=-200;

    if (water.position.y < 0){
        water.position.y += 0.005;
    }

    for ( var c = 0; c < particleGroup.children.length; c ++ ) {
      var sprite = particleGroup.children[ c ];
      sprite.position.y -=0.5;
        if(sprite.position.y < -10){
            sprite.position.y = 20;
        }
    }
};