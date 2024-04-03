
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar')
const bodyElement = document.querySelector('body')
const loadingManager = new THREE.LoadingManager(
    () => {
        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1
            })
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1
            })

            loadingBarElement.classList.add('ended')
            bodyElement.classList.add('loaded')
            loadingBarElement.style.transform = ''

        }, 500)
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        console.log(itemUrl, itemsLoaded, itemsTotal)
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
        console.log(progressRatio)
    },
    () => {

    }
)
const gltfLoader = new THREE.GLTFLoader(loadingManager)

/**
 *  Textures
 */
const textureLoader = new THREE.TextureLoader()
const alphaShadow = textureLoader.load('/assets/texture/simpleShadow.jpg');

// Scene
const scene = new THREE.Scene()

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        transparent: true,
        color: 0x000000,
        opacity: 0.5,
        alphaMap: alphaShadow
    })
)

sphereShadow.rotation.x = -Math.PI * 0.5

sphereShadow.position.y = -1
sphereShadow.position.x = 1.5;

scene.add(sphereShadow)

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
            // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    `,
    uniforms: {
        uAlpha: {
            value: 1.0
        }
    },
    transparent: true
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay)


/**
 * GLTF Model
 */
let donut = null

gltfLoader.load(
    './assets/Pantalla_12x6.glb',
    (gltf) => {
        console.log(gltf);

        donut = gltf.scene

        const radius = 0.0080

        donut.position.x = 1.5;

        donut.rotation.x = -0.35 //hacer la inclinacion es 0.5 hacia abajo
        donut.rotation.y = -2

        donut.position.y = -0.5000

        donut.scale.set(radius, radius, radius)

        scene.add(donut)
    },
    (progress) => {
        console.log(progress);
    },
    (error) => {
        console.error(error);
    }
)

/**
 * Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 5, 5)

directionalLight.castShadow = true
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Scroll
 */
/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;
let isScrolling = false; 
let lastScrollTime = Date.now(); 
let scrollVelocity = 0; 

const transformDonut = [
    {
        rotationZ: 0.45,
        positionX: 1.5
    },
    {
        rotationZ: -0.45,
        positionX: -1.5
    },
    {
        rotationZ: 0.45,
        positionX: 1.5  
    },
    {
        rotationZ: 0.0314,
        positionX: 0
    },
];

// Función para manejar el scroll
const handleScroll = () => {
    scrollY = window.scrollY;
    isScrolling = true; // Indica que el usuario está haciendo scroll

    // Calcula la velocidad de scroll
    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime;
    const distance = Math.abs(scrollY - lastScrollY);
    scrollVelocity = distance / timeDiff; // Pixels por milisegundo
    lastScrollTime = currentTime;
    lastScrollY = scrollY;

    // Espera 50ms antes de actualizar la sección actual
    setTimeout(() => {
        isScrolling = false; // Indica que el scroll se ha detenido
        const newSection = Math.round(scrollY / sizes.height);
        
        if (newSection != currentSection) {
            currentSection = newSection;

            if (donut) {
                // Ajusta la duración de las transiciones basándose en la velocidad de scroll
                const duration = 1.5 / scrollVelocity; // Ajusta este factor según sea necesario

                gsap.to(donut.rotation, {
                    y: "+=" + Math.PI * 1 * (newSection > currentSection ? 2 : -2), // Gira 90 grados
                    duration: duration,
                    ease: 'power2.inOut'
                });

                gsap.to(donut.position, {
                    duration: duration,
                    ease: 'power2.inOut',
                    x: transformDonut[currentSection].positionX
                });

                gsap.to(sphereShadow.position, {
                    duration: duration,
                    ease: 'power2.inOut',
                    x: transformDonut[currentSection].positionX - 0.2
                });

                gsap.to(sphereShadow.position, {
                    duration: duration,
                    ease: 'power2.inOut',
                    y: donut.position.y - 0.5 // Ajusta esto según la posición y la altura del "donut"
                });
            }
        }
    }, 100); // Espera 50ms después del último evento de scroll antes de actualizar la sección actual
};

window.addEventListener('scroll', handleScroll);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 5

scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    if (!!donut) {
        donut.position.y = Math.sin(elapsedTime * 1) * .1 - 0.3
         donut.position.y = Math.sin(elapsedTime * 0.5) * 0.05 - 0.7
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

/**
 * On Reload
 */
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

let lastScrollY = window.scrollY;

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    // Actualizar las proporciones de la cámara
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Actualizar el tamaño del renderizador
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
}
