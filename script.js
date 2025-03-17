// Configuración inicial de Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Luces
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Cámara
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Estado del tigre
let tigerData = {
    name: "Tu Tigre",
    level: 1,
    hunger: 100,
    health: 100,
    energy: 100,
    happiness: 100,
    type: null,
    eyes: null,
    personality: null,
    age: 0,
    scale: 0.5,
    currentScreen: "porch",
    currentToy: null,
};

// Tipos de tigres, ojos y personalidades
const tigerTypes = [
    { type: "Tigre Blanco Clásico", eyes: "azules", color: 0xffffff },
    { type: "Tigre Blanco Ámbar", eyes: "ámbar", color: 0xffd700 },
    { type: "Tigre Blanco Grisáceo", eyes: "grises", color: 0xd3d3d3 }
];

const personalities = [
    { name: "Juguetón", desc: "Le encanta nadar y saltar.", energyDrain: 2, happinessBoost: 15 },
    { name: "Tranquilo", desc: "Prefiere descansar y observar.", energyDrain: 0.5, happinessBoost: 5 },
    { name: "Curioso", desc: "Explora todo y es inquieto.", energyDrain: 1.5, happinessBoost: 10 }
];

// Juguetes
const toys = {
    ball: { name: "Pelota", geometry: new THREE.SphereGeometry(0.3), material: new THREE.MeshPhongMaterial({ color: 0xff4500 }), happiness: 10, energy: -5 },
    mouse: { name: "Ratón de Juguete", geometry: new THREE.BoxGeometry(0.4, 0.2, 0.6), material: new THREE.MeshPhongMaterial({ color: 0x808080 }), happiness: 8, energy: -3 },
    scratcher: { name: "Rascador", geometry: new THREE.CylinderGeometry(0.5, 0.5, 1), material: new THREE.MeshPhongMaterial({ color: 0x8b4513 }), happiness: 12, energy: -7 }
};

const toyObjects = {};
Object.keys(toys).forEach(key => {
    const toy = toys[key];
    toyObjects[key] = new THREE.Mesh(toy.geometry, toy.material);
    toyObjects[key].castShadow = true;
    toyObjects[key].receiveShadow = true;
    toyObjects[key].position.set(Math.random() * 5 - 2.5, 0.5, Math.random() * 5 - 2.5);
    scene.add(toyObjects[key]);
});

// Generar tigre aleatorio
function generateRandomTiger() {
    const type = tigerTypes[Math.floor(Math.random() * tigerTypes.length)];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
    return { ...tigerData, type: type.type, eyes: type.eyes, personality: personality.name, color: type.color };
}

// Modelo del tigre (placeholder)
const tigerGeometry = new THREE.BoxGeometry(1, 1, 1);
const tigerMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const tiger = new THREE.Mesh(tigerGeometry, tigerMaterial);
tiger.castShadow = true;
tiger.receiveShadow = true;
scene.add(tiger);

// Entorno 3D
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xe0e0e0 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const poolGeometry = new THREE.BoxGeometry(5, 0.2, 3);
const poolMaterial = new THREE.MeshPhongMaterial({ color: 0x00b7eb, transparent: true, opacity: 0.8 });
const pool = new THREE.Mesh(poolGeometry, poolMaterial);
pool.position.set(5, 0.1, -5);
scene.add(pool);

const chairGeometry = new THREE.BoxGeometry(1, 1, 1);
const chairMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
const chair = new THREE.Mesh(chairGeometry, chairMaterial);
chair.position.set(-5, 0.5, 5);
scene.add(chair);

// Animaciones
const animations = {
    sit: { duration: 1000, update: (t) => tiger.position.y = Math.max(0, 1 - t) },
    swim: { duration: 2000, update: (t) => {
        tiger.position.y = 0.2 + Math.sin(t * Math.PI * 2) * 0.1;
        tiger.position.x = Math.sin(t * Math.PI) * 2;
    }},
    jump: { duration: 800, update: (t) => tiger.position.y = Math.sin(t * Math.PI) * 2 },
    dance: { duration: 1500, update: (t) => tiger.rotation.y = Math.sin(t * Math.PI * 4) },
    playWithToy: { duration: 1500, update: (t) => {
        const toy = toyObjects[tigerData.currentToy];
        tiger.position.lerp(toy.position, t);
        tiger.rotation.y += 0.1;
    }}
};
let currentAnimation = null;
let animationStart = null;

function playAnimation(name) {
    if ((tigerData.level >= 2 || name === "playWithToy") && animations[name]) {
        currentAnimation = name;
        animationStart = Date.now();
    }
}

function updateAnimation() {
    if (currentAnimation && animationStart) {
        const elapsed = Date.now() - animationStart;
        const anim = animations[currentAnimation];
        const t = Math.min(elapsed / anim.duration, 1);
        anim.update(t);
        if (t >= 1) currentAnimation = null;
    }
}

// Interacciones
function feedTiger() {
    tigerData.hunger = Math.min(100, tigerData.hunger + 20);
    tigerData.happiness += 5;
    updateUI();
    showMessage("¡Tu tigre está comiendo felizmente!");
    saveGame();
    sendNotification("¡Hora de comer!", tigerData.name + " está lleno y feliz.");
}

function playWithTiger() {
    tigerData.happiness = Math.min(100, tigerData.happiness + tigerData.personality.happinessBoost);
    tigerData.energy -= 10;
    updateUI();
    showMessage("¡" + tigerData.name + " está jugando!");
    saveGame();
    sendNotification("¡Jugando!", tigerData.name + " se divierte contigo.");
}

function batheTiger() {
    tigerData.health = Math.min(100, tigerData.health + 15);
    tigerData.energy -= 5;
    updateUI();
    showMessage("¡" + tigerData.name + " está limpio y fresco!");
    saveGame();
}

function sleepTiger() {
    tigerData.energy = Math.min(100, tigerData.energy + 30);
    tigerData.happiness += 5;
    updateUI();
    showMessage("¡" + tigerData.name + " está durmiendo plácidamente!");
    saveGame();
}

function swimTiger() {
    if (tigerData.currentScreen === "pool") {
        playAnimation("swim");
        tigerData.happiness += 10;
        tigerData.energy -= 5;
        updateUI();
        showMessage("¡" + tigerData.name + " está nadando en la piscina!");
        saveGame();
    } else {
        showMessage("Lleva a " + tigerData.name + " a la piscina para nadar.");
    }
}

function toiletTiger() {
    tigerData.health += 10;
    tigerData.happiness -= 2;
    updateUI();
    showMessage("¡" + tigerData.name + " ha usado el baño!");
    saveGame();
}

function playWithToy(toyKey) {
    tigerData.currentToy = toyKey;
    playAnimation("playWithToy");
    tigerData.happiness += toys[toyKey].happiness;
    tigerData.energy += toys[toyKey].energy;
    updateUI();
    showMessage("¡" + tigerData.name + " juega con el " + toys[toyKey].name + "!");
    saveGame();
    sendNotification("¡Juego!", tigerData.name + " está jugando con el " + toys[toyKey].name + ".");
}

// Animaciones desbloqueadas
function sitAnimation() { playAnimation("sit"); }
function danceAnimation() { playAnimation("dance"); }
function jumpAnimation() { playAnimation("jump"); }

// Actualizar interfaz
function updateUI() {
    document.getElementById("tiger-name").textContent = tigerData.name;
    document.getElementById("tiger-type").textContent = tigerData.type;
    document.getElementById("tiger-eyes").textContent = tigerData.eyes;
    document.getElementById("tiger-personality").textContent = tigerData.personality;
    document.getElementById("level").textContent = tigerData.level;
    document.getElementById("hunger").textContent = Math.round(tigerData.hunger);
    document.getElementById("health").textContent = Math.round(tigerData.health);
    document.getElementById("energy").textContent = Math.round(tigerData.energy);
    document.getElementById("happiness").textContent = Math.round(tigerData.happiness);
    document.getElementById("animation-section").style.display = tigerData.level >= 2 ? "block" : "none";

    // Añadir botones de juguetes dinámicamente si no existen
    const interactionButtons = document.getElementById("interaction-buttons");
    if (!document.getElementById("toy-buttons")) {
        const toyDiv = document.createElement("div");
        toyDiv.id = "toy-buttons";
        Object.keys(toys).forEach(key => {
            const btn = document.createElement("button");
            btn.textContent = "Jugar con " + toys[key].name;
            btn.onclick = () => playWithToy(key);
            toyDiv.appendChild(btn);
        });
        interactionButtons.appendChild(toyDiv);
    }
}

// Nombrar al tigre
function setTigerName() {
    const nameInput = document.getElementById("name-input").value.trim();
    if (nameInput) {
        tigerData.name = nameInput;
        updateUI();
        saveGame();
        showMessage("¡Tu tigre ahora se llama " + tigerData.name + "!");
    }
}

// Navegación
function goToScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
    document.getElementById(screenId + "-screen").classList.add("active");
    tigerData.currentScreen = screenId;
    switch (screenId) {
        case "porch": tiger.position.set(-5, 0.5, 5); break;
        case "pool": tiger.position.set(5, 0.2, -5); break;
        case "interior": tiger.position.set(0, 0.5, 0); break;
    }
    saveGame();
}

function goToPorch() { goToScreen("porch"); }
function goToPool() { goToScreen("pool"); }
function goToInterior() { goToScreen("interior"); }

// Mostrar mensajes
function showMessage(text) {
    const messageBox = document.getElementById("message-text");
    messageBox.textContent = text;
    messageBox.parentElement.style.animation = "none";
    void messageBox.parentElement.offsetWidth;
    messageBox.parentElement.style.animation = "fadeInOut 4s ease forwards";
}

// Notificaciones persistentes
function sendNotification(title, body) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SEND_NOTIFICATION',
            payload: { title, body }
        });
    } else if (Notification.permission === "granted") {
        new Notification(title, { body });
    }
}

// Simulación de vida
function simulateLife() {
    const personality = personalities.find(p => p.name === tigerData.personality);
    tigerData.hunger -= 0.5;
    tigerData.energy -= personality.energyDrain;
    tigerData.health -= tigerData.hunger <= 0 ? 2 : 0;
    tigerData.happiness -= tigerData.energy <= 0 ? 3 : 0;
    tigerData.age += 1 / 86400;

    if (tigerData.health <= 0) {
        sendNotification("¡Emergencia!", tigerData.name + " ha muerto. Reinicia el juego.");
        resetGame();
    } else if (tigerData.hunger < 20) {
        sendNotification("¡Hambre!", tigerData.name + " necesita comida urgente.");
    } else if (tigerData.energy < 20) {
        sendNotification("¡Cansancio!", tigerData.name + " está agotado.");
    }

    if (tigerData.age >= tigerData.level && tigerData.level < 5) {
        tigerData.level++;
        tigerData.scale += 0.2;
        tiger.scale.set(tigerData.scale, tigerData.scale, tigerData.scale);
        sendNotification("¡Nivel Up!", tigerData.name + " ha subido al nivel " + tigerData.level + "!");
    }

    updateUI();
    saveGame();
}

// Guardar y cargar
function saveGame() {
    localStorage.setItem("tigerData", JSON.stringify(tigerData));
}

function loadGame() {
    const savedData = localStorage.getItem("tigerData");
    if (savedData) {
        tigerData = JSON.parse(savedData);
        tigerData.personality = personalities.find(p => p.name === tigerData.personality).name;
        tiger.scale.set(tigerData.scale, tigerData.scale, tigerData.scale);
        tigerMaterial.color.setHex(tigerTypes.find(t => t.type === tigerData.type).color);
        goToScreen(tigerData.currentScreen);
        updateUI();
    } else {
        tigerData = generateRandomTiger();
        tigerMaterial.color.setHex(tigerData.color);
        saveGame();
    }
}

function resetGame() {
    localStorage.removeItem("tigerData");
    loadGame();
}

// Cerrar modal
function closeIntroModal() {
    document.getElementById("intro-modal").style.display = "none";
}

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    updateAnimation();
    tiger.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// Inicialización
loadGame();
setInterval(simulateLife, 5000);

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registrado', reg))
        .catch(err => console.error('Error al registrar Service Worker', err));
}

if (Notification.permission !== "granted") Notification.requestPermission();
