const canvas = document.getElementById('geo-canvas');
const ctx = canvas.getContext('2d');
const introScreen = document.getElementById('intro-screen');
const openBtn = document.getElementById('open-btn');
const cardContent = document.getElementById('card-content');
const bgMusic = document.getElementById('bg-music');

let particles = [];
let targetPoints = [];
let animationId;
let width, height;

// Resize canvas
function resize() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    initTreeTargets();
}
window.addEventListener('resize', resize);

// Generate target points in a tree shape (3 Stacked Triangles)
function initTreeTargets() {
    targetPoints = [];
    const treeBaseWidth = width * 0.6;
    const treeTotalHeight = height * 0.6;
    const startX = (width) / 2;
    const startY = height * 0.8; // Bottom of tree

    // We will create 3 levels of triangles
    // Level 1 (Bottom)
    createTriangleLayer(startX, startY, treeBaseWidth, treeTotalHeight * 0.4, 80);
    // Level 2 (Middle)
    createTriangleLayer(startX, startY - treeTotalHeight * 0.3, treeBaseWidth * 0.7, treeTotalHeight * 0.4, 60);
    // Level 3 (Top)
    createTriangleLayer(startX, startY - treeTotalHeight * 0.6, treeBaseWidth * 0.4, treeTotalHeight * 0.4, 40);

    // Add a Star at the top
    targetPoints.push({ x: startX, y: startY - treeTotalHeight, isStar: true });
}

function createTriangleLayer(centerX, bottomY, baseWidth, layerHeight, count) {
    const halfBase = baseWidth / 2;
    const p1 = { x: centerX, y: bottomY - layerHeight }; // Top Tip
    const p2 = { x: centerX - halfBase, y: bottomY }; // Bottom Left
    const p3 = { x: centerX + halfBase, y: bottomY }; // Bottom Right

    for (let i = 0; i < count; i++) {
        let r1 = Math.random();
        let r2 = Math.random();
        if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
        const x = p2.x + r1 * (p3.x - p2.x) + r2 * (p1.x - p2.x);
        const y = p2.y + r1 * (p3.y - p2.y) + r2 * (p1.y - p2.y);
        targetPoints.push({ x, y, isStar: false });
    }
}

class Particle {
    constructor(target) {
        this.target = target;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = target.isStar ? 10 : Math.random() * 3 + 1;
        this.speed = Math.random() * 0.03 + 0.02;

        // Vibrant Christmas & Neon Palette
        const colors = ['#FF0000', '#00FF00', '#D4AF37', '#00FFFF', '#FF00FF', '#FFFFFF'];
        this.color = target.isStar ? '#FFFF00' : colors[Math.floor(Math.random() * colors.length)];

        this.angle = Math.random() * Math.PI * 2;
        this.isStar = target.isStar;
    }

    update() {
        // Lerp to target
        this.x += (this.target.x - this.x) * this.speed;
        this.y += (this.target.y - this.y) * this.speed;
        this.angle += 0.01;

        // Twinkle effect for star
        if (this.isStar) {
            this.size = 8 + Math.sin(Date.now() * 0.005) * 4;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;

        if (this.isStar) {
            // Draw Star
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + 72 * i) / 180 * Math.PI) * this.size,
                    -Math.sin((18 + 72 * i) / 180 * Math.PI) * this.size);
                ctx.lineTo(Math.cos((54 + 72 * i) / 180 * Math.PI) * this.size / 2,
                    -Math.sin((54 + 72 * i) / 180 * Math.PI) * this.size / 2);
            }
            ctx.closePath();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFFF00';
            ctx.fill();
        } else {
            // Draw Triangle
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    targetPoints.forEach(target => {
        particles.push(new Particle(target));
    });
}

// Snow Particle System
let snowflakes = [];
class SnowParticle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        if (this.y > height) {
            this.y = -10;
            this.x = Math.random() * width;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function initSnow() {
    snowflakes = [];
    for (let i = 0; i < 200; i++) {
        snowflakes.push(new SnowParticle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines for geometric effect
    ctx.lineWidth = 0.2;

    // Update and Draw Tree Particles
    particles.forEach((p, index) => {
        p.update();
        p.draw();

        // Connect nearby particles
        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 50) {
                ctx.beginPath();
                ctx.strokeStyle = p.color; // Use particle's color for the line
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    // Update and Draw Snow (Overlay)
    // We want snow to be crisp, even if tree is blurred, but if canvas is blurred, snow on it will blur too.
    // If user wants "later blur bg", we probably want snow to be ON TOP of blur.
    // However, since we use one canvas, the blur applies to everything. 
    // To match "drop some snow from above" request likely implying a foreground effect,
    // we should validly use a separate canvas or accepts that snow blurs too.
    // Given the simple setup, let's keep it one canvas. If it blurs, it looks depth-of-field-y.
    snowflakes.forEach(flake => {
        flake.update();
        flake.draw();
    });

    animationId = requestAnimationFrame(animate);
}

// Interaction
openBtn.addEventListener('click', () => {
    // 1. Play Music
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("Audio play failed", e)); // Handle if file missing

    // 2. Transition UI
    introScreen.style.opacity = '0';
    setTimeout(() => {
        introScreen.style.display = 'none';
        cardContent.classList.remove('hidden');
        cardContent.style.opacity = '1';

        // 3. Start Animation
        resize(); // Ensure correct size
        initTreeTargets();
        initParticles();
        initSnow(); // Start snow
        animate();

        // 4. Trigger Blur Effect after tree forms (approx 3s)
        setTimeout(() => {
            canvas.classList.add('blurred');
        }, 3000);

    }, 1000);
});

// Initial Setup
resize();
