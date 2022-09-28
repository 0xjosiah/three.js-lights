import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
gui.add(gui, 'reset')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 * lights cost a lot performance wise - BE WARY
 * minimal cost lights - ambient, hemisphere
 * moderate - directional, point
 * high - spot, rectArea 
 * 
 * one alt for lights is to 'bake' into the texture
 * done with 3d software
 * drawback - cannot move light
 */
const ambientLight = new THREE.AmbientLight() // helpful to simulate light bouncing off surfaces, so you can see be even without directional light
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = .5
scene.add(ambientLight)
const ambientFolder = gui.addFolder('Ambient')
ambientFolder.add(ambientLight, 'intensity').min(0).max(1).step(.001)

const directionalLight = new THREE.DirectionalLight(0x00fffc, .3)
directionalLight.position.set(1, .25, 0)
scene.add(directionalLight)
const directionalFolder = gui.addFolder('Directional')
directionalFolder.add(directionalLight, 'intensity').min(0).max(1).step(.001)
directionalFolder.addColor(directionalLight, 'color')

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, .3) //lights objects from the bottom and top and blending the two, e.g. red top blue bottom, results in purplish middle
scene.add(hemisphereLight)
const hemisphereFolder = gui.addFolder('Hemisphere')
hemisphereFolder.add(hemisphereLight, 'intensity').min(0).max(1).step(.001)

const pointLight = new THREE.PointLight(0xff9000, .5, 5, 2) // emanates light from infinitely small point in all directions
pointLight.position.set(1, -.5, 1)
scene.add(pointLight)
const pointFolder = gui.addFolder('Point')
pointFolder.add(pointLight, 'intensity').min(0).max(1).step(.001)

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1) // looks like rectangular studio light, throw like in rect shape in one general direction
rectAreaLight.position.set(-1.5, 0, 1.5)
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)
const rectAreaFolder = gui.addFolder('Rectangular Area')
rectAreaFolder.add(rectAreaLight, 'intensity').min(0).max(5).step(.01)

const spotLight = new THREE.SpotLight(0x78ff00, .5, 10, Math.PI * .1, .05, 1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)
spotLight.target.position.x = -.25
scene.add(spotLight.target)
const spotLightFolder = gui.addFolder('Spot')
spotLightFolder.add(spotLight, 'intensity', 0, 1, .001)
spotLightFolder.add(spotLight, 'distance', 0, 100, 1)
spotLightFolder.add(spotLight, 'angle', 0, Math.PI, .001)
spotLightFolder.add(spotLight, 'penumbra', 0, 1, .001)
spotLightFolder.add(spotLight, 'decay', 0, 5, .01)

// Helpers
const addHelperToGui = (value, helperObj) => {
    const {help} = helperObj
    value ? scene.add(help) : scene.remove(help)
}

const hemisphereLightHelper = {
    help: new THREE.HemisphereLightHelper(hemisphereLight, .1),
    helper: false
}
hemisphereFolder.add(hemisphereLightHelper, 'helper').onChange(v => addHelperToGui(v, hemisphereLightHelper))

const directionalLightHelper = {
    help: new THREE.DirectionalLightHelper(directionalLight, .2),
    helper: false
}
directionalFolder.add(directionalLightHelper, 'helper').onChange(v => addHelperToGui(v, directionalLightHelper))

const pointLightHelper = {
    help: new THREE.PointLightHelper(pointLight, .2),
    helper: false,
}
pointFolder.add(pointLightHelper, 'helper').onChange(v => addHelperToGui(v, pointLightHelper))

const spotLightHelper = {
    help: new THREE.SpotLightHelper(spotLight),
    helper: false
}
spotLightFolder.add(spotLightHelper, 'helper').onChange(v => {
    v ? scene.add(spotLightHelper.help) : scene.remove(spotLightHelper.help)
    window.requestAnimationFrame(() => spotLightHelper.help.update())
})


const rectAreaLightHelper = {
    help: new RectAreaLightHelper(rectAreaLight),
    helper: false
}
rectAreaFolder.add(rectAreaLightHelper, 'helper').onChange( value => {
    value ? scene.add(rectAreaLightHelper.help) : scene.remove(rectAreaLightHelper.help)
})

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()