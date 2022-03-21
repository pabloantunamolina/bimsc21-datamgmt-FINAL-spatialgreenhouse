// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js'
import rhino3dm from 'https://cdn.jsdelivr.net/npm/rhino3dm@0.15.0-beta/rhino3dm.module.js'
import { RhinoCompute } from 'https://cdn.jsdelivr.net/npm/compute-rhino3d@0.13.0-beta/compute.rhino3d.module.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'

//GH script
const definitionName = '220227_Spatial greenhouse+aggregation_userstrings.gh'


//SET UP SLIDERS

//MODULE DESIGN
//Module design sliders
const modules_slider = document.getElementById('modules');
modules_slider.addEventListener('mouseup', onSliderChange, false)
modules_slider.addEventListener('touchend', onSliderChange, false)
const root_slider = document.getElementById('root');
root_slider.addEventListener('mouseup', onSliderChange, false)
root_slider.addEventListener('touchend', onSliderChange, false)
//Variable to output under module sliders
var modOut = document.getElementById("modVal");
modOut.innerHTML = modules_slider.value;
modules_slider.oninput = function(){
    modOut.innerHTML = this.value;
}
var rootOut = document.getElementById("rootVal");
rootOut.innerHTML = root_slider.value;
root_slider.oninput = function(){
    rootOut.innerHTML = this.value;
}

//AGGREGATION
//Aggregation toggle
const aggregation = document.getElementById('aggregation');
//Aggregation sliders
const agg_slider = document.getElementById('agg');
agg_slider.addEventListener('mouseup', AstonSliderChange, false);
agg_slider.addEventListener('touchend', AstonSliderChange, false);
const ast_slider = document.getElementById('ast');
ast_slider.addEventListener('mouseup', AstonSliderChange, false);
ast_slider.addEventListener('touchend', AstonSliderChange, false);
//Variable to output under sliders
var aggOut = document.getElementById("aggVal");
aggOut.innerHTML = agg_slider.value;
agg_slider.oninput = function(){
    aggOut.innerHTML = this.value;
}
var astOut = document.getElementById("astVal");
astOut.innerHTML = ast_slider.value;
ast_slider.oninput = function(){
    astOut.innerHTML = this.value;
}

//ANALYSIS VALUES
//Initial diagram values
var skinVal = 1;
var potVal = 0;

//Diagrams values
const outerButtons = document.querySelectorAll('input[name="outerSkin"]');
for (const outerButton of outerButtons) {
    outerButton.addEventListener("click", onSliderChange);
    if (outerButton.checked){
        skinVal = outerButton.value;
    }
}

const potButtons = document.querySelectorAll('input[name="innerSkin"]');
for (const potButton of potButtons) {
    potButton.addEventListener("click", onSliderChange);
    if (potButton.checked){
        potVal = potButton.value;
    }
}


//GRADIENT LEGENDS
var gradientBar = document.getElementById("gradient-roots");
var barHeight = gradientBar.offsetHeight;
var indicators = document.getElementsByClassName("indicator");
var numberOfIndicators = indicators.length;
var counter = 0;
for (var x = 0; x < numberOfIndicators; x++) {
    indicators[x].style.top = counter + "px";
    counter += barHeight / numberOfIndicators + 3;
}


//SET UP RUN AND DOWNLOAD BUTTONS
const runButton = document.getElementById("runButton")
runButton.onclick = run
const downloadButton = document.getElementById("downloadButton")
downloadButton.onclick = download 

//Rhino compute
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
    percentage()
})


//FUNCTION TO AVOID CALLING COMPUTE ACCIDENTALLY
//Run function assigned to button
function run() {

    for (const outerButton of outerButtons){
        if (outerButton.checked){
            skinVal = outerButton.value;
        }
    }

    for (const potButton of potButtons){
        if (potButton.checked){
            potVal = potButton.value;
        }
    }

    document.getElementById('loader').style.display = 'block'
    compute()
}

//Percentage calculated in js, no need for calling compute
function percentage() {

    var mods = agg_slider.value;
    var ast = ast_slider.value;

    var percentage = Math.round(mods / ast * 25 * 100) / 100
    // console.log(percentage)

    document.getElementById('percentage').innerText = percentage + "%"
}

//percentage() called on aggregation sliders change
function AstonSliderChange() {
    // show spinner
    percentage()
}

//Unchecking aggregation checkbox when new data is to be computed
function onSliderChange() {
    document.getElementById("aggregation").checked = false;
}


//COMPUTE
async function compute() {

    //Slider parameters
    const param1 = new RhinoCompute.Grasshopper.DataTree('modules');
    param1.append([0], [modules_slider.valueAsNumber]);
    const param2 = new RhinoCompute.Grasshopper.DataTree('root');
    param2.append([0], [root_slider.valueAsNumber]);
    //Diagram button parameters
    const param3 = new RhinoCompute.Grasshopper.DataTree('skin');
    param3.append([0], [skinVal]);
    const param4 = new RhinoCompute.Grasshopper.DataTree('diagrams');
    param4.append([0], [potVal]);
    
    //Aggregation
    //Checkbox
    const param5 = new RhinoCompute.Grasshopper.DataTree('aggregation');
    param5.append([0], [aggregation.checked]);
    //Slider
    const param6 = new RhinoCompute.Grasshopper.DataTree('agg');
    param6.append([0], [agg_slider.valueAsNumber]);


    // clear values
    const trees = []
    trees.push(param1);
    trees.push(param2);
    trees.push(param3);
    trees.push(param4);
    trees.push(param5);
    trees.push(param6);

    const res = await RhinoCompute.Grasshopper.evaluateDefinition(
        definition, 
        trees
    );

    doc = new rhino.File3dm();

    // hide spinner
    document.getElementById('loader').style.display = 'none'

    //decode GH objects and put them into rhino document
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
    // console.log(objects)
    for ( let i = 0; i < objects.count; i++ ) {
    
        const rhinoObject = objects.get( i );
        // console.log(rhinoObject)
        
        // asign geometry userstrings to object attributes
        if ( rhinoObject.geometry().userStringCount > 0 ) {
            const g_userStrings = rhinoObject.geometry().getUserStrings()
            console.log(g_userStrings)
            rhinoObject.attributes().setUserString(g_userStrings[0][0], g_userStrings[0][1])
            rhinoObject.attributes().setUserString(g_userStrings[1][0], g_userStrings[1][1])

            // const area = rhinoObject.geometry().getUserStrings()[0]
            // const crops = rhinoObject.geometry().getUserStrings()[1]
            // console.log(area);
            // console.log(crops);
        
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

        // console.log(object);
        scene.add(object);

    });

    //Enable download button
    downloadButton.disabled = false;
    runButton.disabled = false;

}


//DOWNLOAD BUTTON
function download (){
    let buffer = doc.toByteArray()
    let blob = new Blob([ buffer ], { type: "application/octect-stream" })
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = 'spatialGreenhouse.3dm'
    link.click()
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