// Particle system och visuella effekter
class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        this.ctx = this.canvas.getContext('2d');
        this.confetti = [];
        this.confettiColors = ['#fde047', '#f97316', '#22c55e', '#3b82f6', '#a855f7'];
        this.particles = [];
        this.setupCanvas();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupCanvas() {
        document.body.appendChild(this.canvas);
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '2'; // Lägg partiklar över spelet
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles(x, y, color, count = 20, type = 'sparkle') {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 4;
            const life = 30 + Math.random() * 60;
            const size = 2 + Math.random() * 4;
            
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life,
                maxLife: life,
                size,
                color,
                type
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Fysik
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.type === 'sparkle') {
                p.vy += 0.1; // gravitation
            }

            // Rita partiklar
            const alpha = p.life / p.maxLife;
            this.ctx.globalAlpha = alpha;
            
            if (p.type === 'sparkle') {
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.type === 'dice') {
                // Större, mer fyrkantiga partiklar för tärningar
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            }
            
            // Ta bort döda partiklar
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        this.ctx.globalAlpha = 1;
        requestAnimationFrame(this.animate);
    }
}

// Ambient bakgrundseffekt
class AmbientBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'ambient-canvas';
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.setupCanvas();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupCanvas() {
        document.body.insertBefore(this.canvas, document.body.firstChild);
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1'; // Lägg bakgrunden under allt
        this.canvas.style.opacity = '0.8'; // Gör den lite transparent
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        this.time += 0.01;
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Gradient-vågor
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, `hsl(${Math.sin(this.time) * 60 + 200}, 70%, 5%)`);
        gradient.addColorStop(1, `hsl(${Math.cos(this.time) * 60 + 240}, 70%, 8%)`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Rita några glödande prickar
        for (let i = 0; i < 5; i++) {
            const x = Math.sin(this.time * (i + 1)) * this.canvas.width/4 + this.canvas.width/2;
            const y = Math.cos(this.time * (i + 0.5)) * this.canvas.height/4 + this.canvas.height/2;
            
            const glow = this.ctx.createRadialGradient(x, y, 0, x, y, 100);
            glow.addColorStop(0, 'rgba(100,150,255,0.1)');
            glow.addColorStop(1, 'transparent');
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        requestAnimationFrame(this.animate);
    }
}

// Exportera för användning i huvudappen
window.ParticleSystem = ParticleSystem;
window.AmbientBackground = AmbientBackground;