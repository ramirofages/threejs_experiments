var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.set(0,0,10);
camera.position.z = 45;
camera.position.y = 15;


var orbit = new THREE.OrbitControls(camera);

var clock = new THREE.Clock(true);
clock.getDelta();



var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );





var myVertexShader = `

  varying vec3 vNormal;
  varying vec3 wNormal;

  varying vec3 world_pos;
  varying vec2 uvs;
  void main() {
    gl_Position = projectionMatrix *
                  modelViewMatrix *
                  vec4(position,1.0);

    vNormal = normal;
    wNormal = (modelMatrix * vec4(normalize(normal),0.0)).xyz;
    world_pos = (modelMatrix * vec4(position,1.0)).xyz;
    uvs = uv;
  }
`;
var myFragmentShader = `
  uniform sampler2D grass;
  uniform sampler2D rock;
  uniform sampler2D diffuse_ramp;

  uniform vec3 light_dir;
  varying vec3 vNormal;
  varying vec3 wNormal;
  varying vec3 world_pos;
  varying vec2 uvs;

  void main() {
    vec3 normal = normalize(wNormal);

    vec2 yUV = world_pos.xz / 20.0;
        vec2 xUV = world_pos.zy / 20.0;
        vec2 zUV = world_pos.xy / 20.0;

        vec3 yDiff = texture2D(grass, yUV).xyz;
        vec3 xDiff = texture2D (grass, xUV).xyz;
        vec3 zDiff = texture2D (grass, zUV).xyz;

    float blend_x = pow(abs(vNormal.x),50.0);
    float blend_y = pow(abs(vNormal.y),50.0);
    float blend_z = pow(abs(vNormal.z),50.0);

    vec3 yDiff_rock = texture2D (rock, yUV).xyz;
        vec3 xDiff_rock = texture2D (rock, xUV).xyz;
        vec3 zDiff_rock = texture2D (rock, zUV).xyz;

    vec3 blendWeights = vec3(blend_x, blend_y, blend_z);

        blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

        vec3 grass_color = xDiff      * blendWeights.x + yDiff      * blendWeights.y + zDiff      * blendWeights.z;
    vec3 rock_color  = xDiff_rock * blendWeights.x + yDiff_rock * blendWeights.y + zDiff_rock * blendWeights.z;

    vec3 final_color = max(0.0, dot(vNormal,vec3(0.0,1.0,0.0))) * grass_color +
                       max(0.0, dot(vNormal,vec3(0.0,-1.0,0.0))) * rock_color;
    //gl_FragColor = vec4(normal * 0.5 + 0.5 , 1.0);
    float diffuse = dot(normalize(light_dir), normal) * 0.5 + 0.5;
    vec3 diffuse_color = texture2D(diffuse_ramp, vec2(diffuse ,0.0)).rgb;
    gl_FragColor = vec4(final_color * diffuse_color , 1.0);
  }
`;



//
//#################################################################################
//#################################################################################

var shaderMaterial =
  new THREE.ShaderMaterial({
    uniforms: {
        grass: { type: "t", value: null},
        rock: { type: "t", value: null},
        diffuse_ramp: { type: "t", value: null},
        light_dir: { type:"v3", value:new THREE.Vector3( 1, 1, -1 )}
    },
    vertexShader:   myVertexShader,
    fragmentShader: myFragmentShader
  });

var skyboxMaterial =
    new THREE.ShaderMaterial({
      uniforms: {
          skybox: { value: null}
      },
      vertexShader:   myVertexShader,
      fragmentShader: skybox_frag,
      depthWrite: false,
      side: THREE.BackSide
    });

var cloudsMaterial =
    new THREE.ShaderMaterial({
      uniforms: {
          _MainTex: { value: null},
          _Frequency : {value : 0},
          _Gain : {value : 0},
          _CutOff : {value : 0},
          _Amplitude : {value : 0},
          _CloudCover : {value : 0},
          _CloudSharpness : {value : 0}
      },
      vertexShader:   myVertexShader,
      fragmentShader: clouds_frag,
      depthWrite: false,
      transparent: true,
      blending: THREE.NormalBlending
    });
//#################################################################################
//#################################################################################



//##############################################################################
//##############################################################################



var uniforms = {
  _Frequency  : 0.0108,
  _Gain  : 0.571,
  _CutOff  : 0.655,
  _Amplitude  : 0.75,
  _CloudCover  : 0.256,
  _CloudSharpness  : 0.078
}

    var colChanged = function( ) {
      cloudsMaterial.uniforms["_Frequency"].value = uniforms._Frequency ;
      cloudsMaterial.uniforms["_Gain"].value = uniforms._Gain;
      cloudsMaterial.uniforms["_CutOff"].value = uniforms._CutOff;
      cloudsMaterial.uniforms["_Amplitude"].value = uniforms._Amplitude;
      cloudsMaterial.uniforms["_CloudCover"].value = uniforms._CloudCover;
      cloudsMaterial.uniforms["_CloudSharpness"].value = uniforms._CloudSharpness;
    };
    colChanged();



      gui = new dat.GUI();
      gui.add( uniforms, "_Frequency", 0.001, 0.2, 0.0025 ).listen().onChange( colChanged );
      gui.add( uniforms, "_Gain", 0, 1, 0.0025 ).listen().onChange( colChanged );
      gui.add( uniforms, "_CutOff", 0, 1, 0.0025 ).listen().onChange( colChanged );
      gui.add( uniforms, "_Amplitude", 0, 1, 0.0025 ).listen().onChange( colChanged );
      gui.add( uniforms, "_CloudCover", 0, 1, 0.0025 ).listen().onChange( colChanged );
      gui.add( uniforms, "_CloudSharpness", 0, 1, 0.0025 ).listen().onChange( colChanged );



//##############################################################################
//##############################################################################




  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
  };

  var onError = function ( xhr ) {
    console.log("EXPLOTO");
  };
  //#################################################################################
  //#################################################################################

  var tex_loader = new THREE.TextureLoader().load("textures/grass.jpg", function(tex){
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    shaderMaterial.uniforms["grass"].value = tex;
    shaderMaterial.needsUpdate = true;


  }, onProgress, onError );

  var tex_loader = new THREE.TextureLoader().load("textures/rock.jpg", function(tex){
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    shaderMaterial.uniforms["rock"].value = tex;
    shaderMaterial.needsUpdate = true;
  }, onProgress, onError );

  var tex_loader = new THREE.TextureLoader().load("textures/island_diffuse_ramp.png", function(tex){
    shaderMaterial.uniforms["diffuse_ramp"].value = tex;
    shaderMaterial.needsUpdate = true;
  }, onProgress, onError );

  var loader = new THREE.CubeTextureLoader();
  loader.setPath( 'textures/' );
  loader.load( [
        'sky_px.png', 'sky_nx.png',
        'sky_py.png', 'sky_ny.png',
        'sky_pz.png', 'sky_nz.png'
    ], function ( cubemap ) {
      skyboxMaterial.uniforms["skybox"].value = cubemap;
      skyboxMaterial.needsUpdate = true;
    }, onProgress, onError );

  var manager = new THREE.LoadingManager();


   var cloud_tex_array = new Uint8Array(32*1024 * 3);
   for(var i=0; i< 32*1024 * 3; i++)
   {
        cloud_tex_array[i] = Math.random() * 255 | 0;
   }
   var cloud_texture = new THREE.DataTexture(cloud_tex_array, 32, 1024,
                    THREE.RGBFormat);
   cloud_texture.wrapS = THREE.RepeatWrapping;
   cloud_texture.wrapT = THREE.RepeatWrapping;
   cloud_texture.magFilter = THREE.LinearFilter;
   cloud_texture.needsUpdate = true;

   cloudsMaterial.uniforms["_MainTex"].value = cloud_texture;
   cloudsMaterial.needsUpdate = true;
  //#################################################################################


    var loader = new THREE.OBJLoader( manager );

  var island = null;
    loader.load( 'models/floating_island.obj', function ( object ) {

        object.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                //child.material =  new THREE.MeshNormalMaterial();
        child.material =  shaderMaterial;

            }

        } );

    object.position.set(0,0,0);
    island = object;
    camera.lookAt(object.position);

        scene.add( object );

    }, onProgress, onError );


  var animation = null;
  var kfAnimation = null;
  var loader = new THREE.ColladaLoader();

    loader.options.convertUpAxis = true;
    loader.load( './models/molino.dae', function ( collada ) {
        dae = collada.scene;

    kfAnimation = new THREE.KeyFrameAnimation( collada.animations[0] );
        kfAnimation.timeScale = 1;
    kfAnimation.loop = false;
        kfAnimation.play(0);
        dae.traverse( function ( child ) {

      if ( child instanceof THREE.Mesh ) {
                child.material =  new THREE.MeshNormalMaterial();
        //child.material =  new THREE.MeshBasicMaterial( { color: 0x00ffff} );;
            }
        } );

    dae.position.y +=9;
    dae.position.z -=15;

        dae.scale.x = dae.scale.y = dae.scale.z = 0.5;
    dae.updateMatrix();
    scene.add( dae );
    } );

  //#################################################################################
  //#################################################################################




  //
  //var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var basic_material = new THREE.MeshBasicMaterial( { color: 0xffffff} );

  var sphere = new THREE.Mesh( geometry, skyboxMaterial );
  var test_cube = new THREE.Mesh( geometry, cloudsMaterial );
  sphere.position.copy(camera.position);

  test_cube.position.copy(camera.position);
  test_cube.position.z-=40;
  test_cube.position.y -=10;
  test_cube.scale.set(60,30,30);
  scene.add( sphere );
  scene.add(test_cube);


  //#################################################################################
  //#################################################################################

  var last_timestamp=0;

  var render = function (timestamp) {
    stats.begin();

    requestAnimationFrame( render );

    // monitored code goes here


    orbit.update();
    var delta = clock.getDelta();

    if(island !== null)
    {
      var dir = camera.position.sub(island.position);
      dir.applyAxisAngle(new THREE.Vector3(0,-1,0),delta / 10);
      camera.position.copy(dir.add(island.position));
      var look_view = (new THREE.Vector3(0,10,0)).add(island.position);
      camera.lookAt(look_view);
      sphere.position.copy(camera.position);

    }
    if(kfAnimation !== null)
    {
      kfAnimation.update(delta);
      if(kfAnimation.currentTime >= kfAnimation.data.length){kfAnimation.stop();kfAnimation.play(0);}
    }

    renderer.render(scene, camera);
    stats.end();
};

render();
