// --- DOM ELEMENTS ---
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const mainTitle = document.getElementById('mainTitle');
const card = document.querySelector('.card');
const container = document.querySelector('.container'); // Acts as our device screen

// --- SMART NO BUTTON (STRICT DEVICE CONTAINMENT) ---
function moveButton(e) {
    // 1. Logic to detach button from card if it's still inside
    // This allows it to float over the entire screen/container
    if (noBtn.parentNode !== container) {
        const rect = noBtn.getBoundingClientRect();
        container.appendChild(noBtn);
        noBtn.style.position = 'absolute';
        // Position it exactly where it was visually
        noBtn.style.left = rect.left + 'px';
        noBtn.style.top = rect.top + 'px';
    }

    // 2. Get Boundaries (The Container/Device Screen)
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect(); // Obstacle

    // 3. Get Pointer Position
    let pointerX, pointerY;
    if (e.type.includes('touch')) {
        pointerX = e.touches[0].clientX;
        pointerY = e.touches[0].clientY;
    } else {
        pointerX = e.clientX;
        pointerY = e.clientY;
    }

    // 4. Calculate Safe Zone (Within Container)
    const padding = 20;
    const maxX = containerRect.width - btnRect.width - padding;
    const maxY = containerRect.height - btnRect.height - padding;
    const minX = padding;
    const minY = padding;

    let newX, newY, safe = false;
    let attempts = 0;

    // 5. Attempt to find a valid spot
    while (!safe && attempts < 150) {
        attempts++;
        
        // Random Coordinate relative to Container
        newX = Math.random() * (maxX - minX) + minX;
        newY = Math.random() * (maxY - minY) + minY;

        // Convert to Global Coordinates for collision checking
        const globalX = containerRect.left + newX;
        const globalY = containerRect.top + newY;

        // CHECK A: Is it too close to the finger? (Evasion radius: 120px)
        const distX = globalX - pointerX;
        const distY = globalY - pointerY;
        const dist = Math.sqrt(distX*distX + distY*distY);
        
        if (dist < 120) continue; // Too close, retry

        // CHECK B: Does it overlap the YES button?
        const buffer = 30;
        if (
            globalX < yesRect.right + buffer &&
            globalX + btnRect.width > yesRect.left - buffer &&
            globalY < yesRect.bottom + buffer &&
            globalY + btnRect.height > yesRect.top - buffer
        ) {
            continue; // Overlaps Yes button, retry
        }

        safe = true;
    }

    // 6. Apply Movement
    // If calculation failed (rare), just move it to a corner as fallback
    if (!safe) {
        newX = padding;
        newY = padding;
    }

    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
    
    // Add rotation for fun
    noBtn.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
}

// Events for Desktop and Mobile
noBtn.addEventListener('mouseover', moveButton);
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default click
    moveButton(e);
});


// --- YES BUTTON & CONFETTI ---
yesBtn.addEventListener('click', () => {
    mainTitle.innerText = "YAY!  Love you!";
    mainTitle.style.fontSize = "2.5rem";
    mainTitle.style.color = "#E91E63";
    
    // Hide buttons
    document.querySelector('.btn-group').style.display = 'none'; 
    noBtn.style.display = 'none'; 
    
    initConfetti();
});


// --- CONFETTI LOGIC ---
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let particles = [];

function initConfetti() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    for(let i=0; i<150; i++) {
        particles.push({
            x: window.innerWidth/2,
            y: window.innerHeight/2,
            vx: (Math.random()-0.5)*15,
            vy: (Math.random()-0.5)*15 - 5,
            color: `hsl(${Math.random()*360}, 100%, 60%)`,
            size: Math.random()*8+4,
            life: 1
        });
    }
    animateConfetti();
}

function animateConfetti() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach((p,i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.vx *= 0.95;
        p.life -= 0.008;
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        
        if(p.life <= 0) particles.splice(i,1);
    });
    if(particles.length > 0) requestAnimationFrame(animateConfetti);
}


