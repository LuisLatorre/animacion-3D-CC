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

        const radius = 0.0090

        donut.position.x = 1.5;

        donut.rotation.x = -0.35 //hacer la inclinacion es 0.5 hacia abajo
        donut.rotation.y = -2

        donut.position.y = 0.5

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

// Opacidad para los textos al momento de scrolear
// const adjustCanvasOpacityOnScroll = () => {
//     const canvasElement = document.querySelector('canvas.webgl');
     
//     const textApproachPoint = 350; // Ejemplo de valor, ajusta según sea necesario
   
//     if (isMobile()) {
//        if (scrollDistance < textApproachPoint) {
//          canvasElement.style.opacity = 1;
//        } else {
//          const opacity = Math.max(0.50, 1 - (scrollDistance - textApproachPoint) / 300);
//          canvasElement.style.opacity = opacity;
//        }
//     }
//    };
   

//    window.addEventListener('scroll', adjustCanvasOpacityOnScroll);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
};

/**
 * Resize event
 */
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.aspectRatio = window.innerWidth / window.innerHeight;

    camera.aspect = sizes.aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
});

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

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

// Función de debounce
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

// Modifica la función handleScroll para que no aplique movimientos en pantallas móviles
const handleScroll = () => {
    // Evita que el donut se mueva con el scroll en pantallas móviles
    if (isMobile()) {
        return;
    }

    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);

    if (newSection != currentSection) {
        currentSection = newSection;

        if (donut) {
            gsap.to(donut.rotation, {
                y: "+=" + Math.PI * 1 * (newSection > currentSection ? 2 : -2), // Gira 90 grados
                duration: 1.5,
                ease: 'power2.inOut'
            });

            gsap.to(donut.position, {
                duration: 1.5,
                ease: 'power2.inOut',
                x: transformDonut[currentSection].positionX
            });

            gsap.to(sphereShadow.position, {
                duration: 1.5,
                ease: 'power2.inOut',
                x: transformDonut[currentSection].positionX - 0.2
            });

            gsap.to(sphereShadow.position, {
                duration: 1.5,
                ease: 'power2.inOut',
                y: donut.position.y - 0.5
            });
        }
    }
};

const handleScrollDebounced = debounce(handleScroll, 100);

window.addEventListener('scroll', handleScrollDebounced);

/**
 * Camera
 */
// Base camera
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(35, aspectRatio, 0.1, 1000);
camera.position.z = 5;

scene.add(camera);

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

    renderer.render(scene, camera)

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
/**
 * Definiciones de la segunda Funciones de Animación
 */
const isMobile = () => window.innerWidth < 768;

const animateDonutOnMobile = () => {
  if (!donut || !sphereShadow) return;

  donut.position.set(0, 0.5, 0);
  sphereShadow.position.set(donut.position.x, -1, donut.position.z);

  // Cancela cualquier animación previa
  gsap.killTweensOf(donut.rotation);
  gsap.killTweensOf(sphereShadow.position);

  // Anima la rotación del donut
  gsap.to(donut.rotation, {
    y: "+=" + (Math.PI * 2 * 2), // Rota 360 grados en el eje Y, 2 veces
    duration: 8,
    ease: "none",
  });
};


const updateDonutAnimation = () => {
  if (isMobile()) {
    animateDonutOnMobile();
  }
};

window.addEventListener('resize', debounce(updateDonutAnimation, 250));
updateDonutAnimation();