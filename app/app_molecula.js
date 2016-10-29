var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({antialias : true, alpha: true});
renderer.setClearColor( 0x000000, 0);

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.set(0,0,30);



//var orbit = new THREE.OrbitControls(camera);

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
  uniform vec3 _FirstColor;
  uniform vec3 _SecondColor;
  uniform vec3 light_dir;
  uniform float _Alpha;
  uniform float _Fade;
  varying vec3 vNormal;
  varying vec3 wNormal;
  varying vec3 world_pos;

  void main() {

    vec3 normal = normalize(wNormal);
		vec3 view_dir = normalize(cameraPosition - world_pos);

		float diffuse = dot(normal , light_dir);

		float diffuse_view = dot(normal, view_dir);

		float t = diffuse * 0.5 + 0.5;
    //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    float transparency = mix((1.0 - diffuse_view * 0.8), _Alpha, _Fade);
		gl_FragColor = vec4(mix(_FirstColor, _SecondColor, t), transparency);

  }
`;




//
//#################################################################################
//#################################################################################

var shaderMaterial =
  new THREE.ShaderMaterial({
    uniforms: {
        // grass: { type: "t", value: null},
        // rock: { type: "t", value: null},
        _FirstColor: { type: "v3", value: new THREE.Vector3( 0.447, 0.686, 0.882)},
        _SecondColor: { type: "v3", value: new THREE.Vector3( 0.843, 0.427, 0.623)},
        light_dir: { type:"v3", value:new THREE.Vector3( 0.4, -1, -0.5 )},
        _Alpha: {type:"f", value: 0},
        _Fade: {type:"f", value: 0}

    },
    vertexShader:   myVertexShader,
    fragmentShader: myFragmentShader,
    depthWrite: false,
    transparent: true,
    blending: THREE.NormalBlending
  });

  var shaderMaterial2 =
    new THREE.ShaderMaterial({
      uniforms: {
          // grass: { type: "t", value: null},
          // rock: { type: "t", value: null},
          _FirstColor: { type: "v3", value: new THREE.Vector3( 0.447, 0.686, 0.882)},
          _SecondColor: { type: "v3", value: new THREE.Vector3( 0.843, 0.427, 0.623)},
          light_dir: { type:"v3", value:new THREE.Vector3( 0.4, -1, -0.5 )},
          _Alpha: {type:"f", value: 0.5},
          _Fade: {type:"f", value: 1}

      },
      vertexShader:   myVertexShader,
      fragmentShader: myFragmentShader,
      depthWrite: false,
      transparent: true,
      blending: THREE.NormalBlending
    });



//##############################################################################
//##############################################################################



var uniforms = {
  Alpha_big  : 0,
  Fade_big  : 0,
  Alpha_small : 0.5,
  Fade_small : 1,

}

    var colChanged = function( ) {
       shaderMaterial.uniforms["_Alpha"].value = uniforms.Alpha_big ;
       shaderMaterial.uniforms["_Fade"].value = uniforms.Fade_big ;
       shaderMaterial2.uniforms["_Alpha"].value = uniforms.Alpha_small ;
       shaderMaterial2.uniforms["_Fade"].value = uniforms.Fade_small ;

    };
    colChanged();



      gui = new dat.GUI();
      gui.add( uniforms, "Fade_big", 0, 1, 0.0025 ).listen().onChange( colChanged );
      gui.add( uniforms, "Alpha_big", 0, 1, 0.0025 ).listen().onChange( colChanged );
      gui.add( uniforms, "Fade_small", 0, 1, 0.0025 ).listen().onChange( colChanged );
      gui.add( uniforms, "Alpha_small", 0, 1, 0.0025 ).listen().onChange( colChanged );




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

  // var tex_loader = new THREE.TextureLoader().load("textures/grass.jpg", function(tex){
  //   tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  //   shaderMaterial.uniforms["grass"].value = tex;
  //   shaderMaterial.needsUpdate = true;
  //
  //
  // }, onProgress, onError );

  //

  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  var geometry_small = new THREE.SphereGeometry( 1.2, 32, 32 );
  var basic_material = new THREE.MeshBasicMaterial( { color: 0xffffff} );

  var sphere = new THREE.Mesh( geometry, shaderMaterial );
  var sphere_small = new THREE.Mesh( geometry_small, shaderMaterial2 );
  sphere_small.position.set(0.2,0.3,0);
  sphere.scale.x = 1.1;

  sphere.add(sphere_small);
  sphere.position.x-=20;
  sphere.position.y -=5;

  var sphere_2 = sphere.clone();
  sphere_2.position.set(25,30,-50);
  sphere_2.children[0].position.x+=1.5;


  var sphere_3 = sphere.clone();
  sphere_3.position.set(45,-15,-30);
  sphere_3.children[0].position.x-=0.5;

  var sphere_4 = sphere.clone();
  sphere_4.position.set(55,-8,-35);
  sphere_4.children[0].position.x-=0.3;


  scene.add(sphere_2);
  scene.add( sphere );
  scene.add(sphere_3);
  scene.add(sphere_4);

  //#################################################################################
  //#################################################################################

  var last_timestamp=0;

  var sphere_initial_pos = sphere.position.clone();
  var sphere_3_initial_pos = sphere_3.position.clone();

  var render = function (timestamp) {
    stats.begin();

    requestAnimationFrame( render );
    var x = Math.sin(timestamp/1000);
    sphere.position.x = sphere_initial_pos.x + x/3.5 ;
    sphere.position.y = sphere_initial_pos.y + x/5 ;

    sphere_3.position.x = sphere_3_initial_pos.x + x/4 ;

    renderer.render(scene, camera);
    stats.end();
};

render();
