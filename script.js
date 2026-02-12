const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const content = document.querySelector('.content');
const successMessage = document.getElementById('successMessage');
const appView = document.getElementById('app-view');
const gameWorld = document.getElementById('game-world');
const simBtn = document.getElementById('simBtn');

let yesSize = 1;
let hoverCount = 0;
let isAllYes = false;

// Mobile Simulator Toggle
simBtn.addEventListener('click', () => {
    appView.classList.toggle('mobile-sim');
    if (appView.classList.contains('mobile-sim')) {
        simBtn.innerText = "💻 Toggle Desktop View";
        yesBtn.style.transform = 'scale(1)'; // Reset scale for mobile
    } else {
        simBtn.innerText = "📱 Toggle Mobile View";
        yesBtn.style.transform = `scale(${yesSize})`; // Restore scale for desktop
    }
});

function teleportNo() {
    const padding = 20;

    // BOUNDS: Use gameWorld dimensions
    const bounds = gameWorld.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();

    const worldWidth = gameWorld.clientWidth;
    const worldHeight = gameWorld.clientHeight;

    // We need unscaled dimensions if possible, or just consistency.
    // gameWorld.clientWidth IS unscaled if we use the element directly, 
    // but getBoundingClientRect is scaled.
    // Let's use gameWorld properties which ignore transform for internal coordinate math usually.

    // Logic for finding a valid position for the "No" button

    let x, y;
    let attempts = 0;
    let isCovered;

    do {
        // Generate random position within gameWorld
        x = padding + Math.random() * (worldWidth - noBtn.offsetWidth - padding * 2);
        y = padding + Math.random() * (worldHeight - noBtn.offsetHeight - padding * 2);

        // Convert to Viewport Coordinates to safety check against "Yes" button
        // Account for border (bezel) offset using clientLeft/clientTop
        const worldRect = gameWorld.getBoundingClientRect();
        const potentialLeft = worldRect.left + gameWorld.clientLeft + x;
        const potentialTop = worldRect.top + gameWorld.clientTop + y;
        const potentialRight = potentialLeft + noBtn.offsetWidth;
        const potentialBottom = potentialTop + noBtn.offsetHeight;

        // Check intersection with Yes Button (which is also in Viewport coords via getBoundingClientRect)
        isCovered = (
            potentialLeft < yesRect.right &&
            potentialRight > yesRect.left &&
            potentialTop < yesRect.bottom &&
            potentialBottom > yesRect.top
        );
        attempts++;
    } while (isCovered && attempts < 20);

    // MOVE TO GAME WORLD
    if (noBtn.parentNode !== gameWorld) {
        gameWorld.appendChild(noBtn);
    }

    noBtn.style.position = 'absolute';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    noBtn.style.zIndex = "1000";
}

function moveNoButton() {
    if (isAllYes) return;

    hoverCount++;

    // Scale Yes bigger
    // Check if mobile (simulated or real)
    const isMobile = appView.classList.contains('mobile-sim') || window.innerWidth <= 600;

    if (hoverCount < 5 && !isMobile) {
        yesSize += 0.5;
        yesBtn.style.transform = `scale(${yesSize})`;
    }

    // Special logic for hover 3: Swap without teleporting
    if (hoverCount === 3) {
        // Return to container for the swap
        const buttonsContainer = document.querySelector('.buttons');
        if (noBtn.parentNode !== buttonsContainer) {
            buttonsContainer.appendChild(noBtn);
        }

        noBtn.style.position = 'static';
        noBtn.style.transform = 'scale(1)';
        noBtn.style.zIndex = "auto";

        const buttons = Array.from(buttonsContainer.children);
        buttonsContainer.innerHTML = '';
        buttonsContainer.appendChild(buttons[1]);
        buttonsContainer.appendChild(buttons[0]);
        return;
    }

    // Special logic for hover 5: All-Yes state
    if (hoverCount === 5) {
        isAllYes = true;

        // Return to container
        const buttonsContainer = document.querySelector('.buttons');
        if (noBtn.parentNode !== buttonsContainer) {
            buttonsContainer.appendChild(noBtn);
        }

        noBtn.style.position = 'static';
        noBtn.style.transform = 'scale(1)';
        noBtn.style.zIndex = "auto";
        noBtn.innerText = 'Yes';
        noBtn.classList.remove('no');
        noBtn.classList.add('yes');

        yesBtn.style.position = 'static';
        yesBtn.style.transform = 'scale(1)';

        noBtn.onclick = () => {
            yesBtn.click();
        };
        return;
    }

    // Normal teleport for hovers 1, 2, and 4
    teleportNo();
}

noBtn.addEventListener('mouseover', moveNoButton);

// For touch devices
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButton();
});

// For mobile taps (fallback)
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton();
});

yesBtn.addEventListener('click', () => {
    content.classList.add('hidden');
    successMessage.classList.remove('hidden');

    // Dynamic message based on interaction
    const successText = document.getElementById('successText');
    if (hoverCount > 0) {
        successText.innerText = "I knew you would say yes! ❤";
    } else {
        successText.innerText = "Yay! I am so happy! ❤";
    }

    startHeartRain();
});

// Cursor Sparkle Effect
document.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.1) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.left = e.pageX + 'px';
        sparkle.style.top = e.pageY + 'px';
        document.body.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1000);
    }
});

function startHeartRain() {
    const heartEmojis = ['💗', '❤'];

    setInterval(() => {
        const heart = document.createElement('div');
        heart.classList.add('heart');

        const randomEmoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        heart.innerHTML = randomEmoji;

        const size = Math.random() * 2 + 1;
        const delay = Math.random() * 2;
        const duration = Math.random() * 3 + 2;
        const left = Math.random() * 100;
        const blur = Math.random() * 2;

        heart.style.fontSize = `${size}rem`;
        heart.style.left = `${left}%`; // Changed to % to fit container
        heart.style.animationDuration = `${duration}s`;
        heart.style.animationDelay = `-${delay}s`;
        heart.style.filter = `blur(${blur}px)`;
        heart.style.opacity = Math.random() * 0.5 + 0.5;

        // Append to GAME WORLD to ensure it scales
        gameWorld.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }, 150);
}
