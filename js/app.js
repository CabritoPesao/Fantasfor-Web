const links = document.querySelectorAll('.menu-dropdown a[data-page]');
const frame = document.getElementById('contentFrame');
const header = document.querySelector('.topbar');

const pathMap = {
    comfort: "comfort",
    boss: "boss",
    leather: "leather",
    food: "food",
    plantation: "plantation",
    status: "status",
    "weapon-mastery": "weapon-mastery",
    "build-maker": "build-maker",
    "stack-calculator": "stack-calculator",
    normal: "normal",
    tribe: "tribe",
    origin: "origin",
    title: "title",
    "videos-channel": "videos-channel"
};

function setActive(el) {
    links.forEach(l => l.classList.remove('active'));
    el.classList.add('active');
}

function resizeFrame() {
    const h = header.offsetHeight;
    frame.style.height = `${window.innerHeight - h}px`;
}

links.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const page = link.dataset.page;

        if (page === "home") {
            frame.src = "home.html"; // Home desde la raíz
        } else {
            const dir = pathMap[page];
            if (dir) frame.src = `pages/${dir}/index.html`;
        }

        setActive(link);
    });
});

window.addEventListener('resize', resizeFrame);
resizeFrame();

// Activar Home por defecto
const homeLink = document.querySelector('[data-page="home"]');
setActive(homeLink);
frame.src = "home.html";

const logo = document.getElementById('logo-home');
logo.addEventListener('click', () => {
    // Simula clic en el enlace Home
    const homeLink = document.querySelector('[data-page="home"]');
    if (homeLink) {
        homeLink.click();
    }
});

