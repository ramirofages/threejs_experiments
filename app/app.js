
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.set(0,0,10);
//camera.position.set(5,-82,28);
// camera.position.x = 5;
// camera.position.y = -84;
//
// camera.position.z = 34;

var myVertexShader = `

  varying vec3 vNormal;
  varying vec3 world_pos;
  varying vec2 uvs;
  void main() {
    gl_Position = projectionMatrix *
                  modelViewMatrix *
                  vec4(position,1.0);

    vNormal = normal;
    world_pos = (modelMatrix * vec4(position,1.0)).xyz;
    uvs = uv;
  }
`;
var myFragmentShader = `
  uniform sampler2D grass;
  uniform sampler2D rock;

  varying vec3 vNormal;
  varying vec3 world_pos;
  varying vec2 uvs;

  void main() {

    vec2 yUV = world_pos.xz / 10.0;
		vec2 xUV = world_pos.zy / 10.0;
		vec2 zUV = world_pos.xy / 10.0;

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
    //gl_FragColor = vec4(vNormal * 0.5 + 0.5 , 1.0);
    gl_FragColor = vec4(final_color , 1.0);
    //gl_FragColor = vec4(texture2D(grass,uvs).xyz , 1.0);
  }
`;

var skybox_frag= `
varying vec3 vNormal;
varying vec3 world_pos;
uniform samplerCube skybox;

  void main(){
    //gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0);

    gl_FragColor = vec4(textureCube(skybox,vNormal).xyz , 1.0);
  }
`;
//
//#################################################################################
//#################################################################################

var shaderMaterial =
  new THREE.ShaderMaterial({
    uniforms: {
        grass: { type: "t", value: null},
        rock: { type: "t", value: null}
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
//#################################################################################
//#################################################################################

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


  //#################################################################################


	var loader = new THREE.OBJLoader( manager );
	loader.load( 'models/floating_island.obj', function ( object ) {

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Mesh ) {

				//child.material =  new THREE.MeshNormalMaterial();
        child.material =  shaderMaterial;
			}

		} );

		//object.position.y = - 95;
    object.position.set(0,0,0);
    camera.lookAt(object.position);

		scene.add( object );

	}, onProgress, onError );

  //#################################################################################
  //#################################################################################

camera.position.z = 50;
camera.position.y = 15;


  //
  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  //var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0xffffff} );

  var sphere = new THREE.Mesh( geometry, skyboxMaterial );
  sphere.position.copy(camera.position);
  scene.add( sphere );
  var render = function () {
  	requestAnimationFrame( render );


  	renderer.render(scene, camera);
};

render();
