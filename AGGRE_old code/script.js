// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'
import { RhinoCompute } from 'https://cdn.jsdelivr.net/npm/compute-rhino3d@0.13.0-beta/compute.rhino3d.module.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'

const definitionName = 'spatialGreenhouse-aggregation.gh'

// Set up sliders
const radius_slider = document.getElementById('radius')
radius_slider.addEventListener('mouseup', onSliderChange, false)
radius_slider.addEventListener('touchend', onSliderChange, false)
// How do I change the slider background?
//radius_slider.background = new THREE.Color("rgb(255, 0, 255)")

const count_slider = document.getElementById('count')
count_slider.addEventListener('mouseup', onSliderChange, false)
count_slider.addEventListener('touchend', onSliderChange, false)

//slider addition
const thickness_slider = document.getElementById('thickness')
thickness_slider.addEventListener('mouseup', onSliderChange, false)
thickness_slider.addEventListener('touchend', onSliderChange, false)

const loader = new Rhino3dmLoader()
loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/')

let rhino, definition, doc
rhino3dm().then(async m => {
    console.log('Loaded rhino3dm.')
    rhino = m // global

    //RhinoCompute.url = getAuth( 'RHINO_COMPUTE_URL' ) // RhinoCompute server url. Use http://localhost:8081 if debugging locally.
    //RhinoCompute.apiKey = getAuth( 'RHINO_COMPUTE_KEY' )  // RhinoCompute server api key. Leave blank if debugging locally.
    RhinoCompute.url = 'http://localhost:8081/' //if debugging locally.
    

    // load a grasshopper file!
    const url = definitionName
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const arr = new Uint8Array(buffer)
    definition = arr

    init()
    compute()
})

async function compute() {


    const param1 = new RhinoCompute.Grasshopper.DataTree('Radius')
    param1.append([0], [radius_slider.valueAsNumber])

    const param2 = new RhinoCompute.Grasshopper.DataTree('Count')
    param2.append([0], [count_slider.valueAsNumber])
    //new parameter
    const param3 = new RhinoCompute.Grasshopper.DataTree('Thickness')
    param3.append([0], [thickness_slider.valueAsNumber])

    // clear values
    const trees = []
    trees.push(param1);
    trees.push(param2);
    //new value
    trees.push(param3);

    const res = await RhinoCompute.Grasshopper.evaluateDefinition(
        definition, 
        trees
    );

    doc = new rhino.File3dm();

    // hide spinner
    document.getElementById('loader').style.display = 'none'

    for (let i = 0; i < res.values.length; i++) {

        for (const [key, value] of Object.entries(res.values[i].InnerTree)) {
            for (const d of value) {

                const data = JSON.parse(d.data)
                const rhinoObject = rhino.CommonObject.decode(data)
                doc.objects().add(rhinoObject, null)

            }
        }
    }


  // go through the objects in the Rhino document

    let objects = doc.objects();
    for ( let i = 0; i < objects.count; i++ ) {
    
        const rhinoObject = objects.get( i );

        
        // asign geometry userstrings to object attributes
        if ( rhinoObject.geometry().userStringCount > 0 ) {
            const g_userStrings = rhinoObject.geometry().getUserStrings()
            //console.log(g_userStrings)
            rhinoObject.attributes().setUserString(g_userStrings[0][0], g_userStrings[0][1])
        
        }
    }





    // clear objects from scene
    scene.traverse(child => {
        if (!child.isLight) {
            scene.remove(child)
        }
    })


    const buffer = new Uint8Array(doc.toByteArray()).buffer;


    loader.parse(buffer, function (object) {
  
        // go through all objects, check for userstrings and assing colors
    
          object.traverse((child) => {
              if (child.isLine) {
      
                  //convert color from userstring to THREE color and assign it
                  const threeColor = new THREE.Color("rgb(170,170,170)");
                  const mat = new THREE.LineBasicMaterial({ color: threeColor });
                  child.material = mat;
                  
              }
          });
  
          ///////////////////////////////////////////////////////////////////////
          // add object graph from rhino model to three.js scene
          scene.add(object);
  
    });


    // loader.parse(buffer, function (object) {
  
    //   // go through all objects, check for userstrings and assing colors
  
    //     object.traverse((child) => {
    //         if (child.isLine) {
    
    //             if (child.userData.attributes.geometry.userStringCount > 0) {
                    
    //                 //get color from userStrings
    //                 const colorData = child.userData.attributes.userStrings[0]
    //                 const col = colorData[1];
        
    //                 //convert color from userstring to THREE color and assign it
    //                 const threeColor = new THREE.Color("rgb(" + col + ")");
    //                 const mat = new THREE.LineBasicMaterial({ color: threeColor });
    //                 child.material = mat;
    //             }
    //         }
    //     });

    //     ///////////////////////////////////////////////////////////////////////
    //     // add object graph from rhino model to three.js scene
    //     scene.add(object);

    // });
}


function onSliderChange() {
    // show spinner
    document.getElementById('loader').style.display = 'block'
    compute()
}




// BOILERPLATE //

let scene, camera, renderer, controls

function init() {

    // Rhino models are z-up, so set this as the default
    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );

    // create a scene and a camera
    scene = new THREE.Scene()
    //scene.background = new THREE.Color(0x000000, 0)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.x = - 50
    camera.position.y = - 50
    camera.position.z = - 50

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer({ antialias: true }) //alpha: true to set transparent background
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // add some controls to orbit the camera
    controls = new OrbitControls(camera, renderer.domElement)

    // add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.intensity = 2
    scene.add(directionalLight)

    const ambientLight = new THREE.AmbientLight()
    scene.add(ambientLight)

    let cubeMap

    cubeMap = new THREE.CubeTextureLoader()
        .setPath('textures/cube/earth/')
        .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] )
    
    scene.background = cubeMap

    animate()
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    animate()
}

//const material = new THREE.MeshNormalMaterial()

function meshToThreejs(mesh, material) {
    const loader = new THREE.BufferGeometryLoader()
    const geometry = loader.parse(mesh.toThreejsJSON())
    //how do I give a material to the wireframe?
    //const material = new THREE.material({ wireframe: true })
    return new THREE.Mesh(geometry, material)
}

function animate() {
    requestAnimationFrame(animate)

    // //rotate shape a bit
    // meshToThreejs.rotation.x += 0.01
    // meshToThreejs.rotation.y += 0.01

    renderer.render(scene, camera)
}