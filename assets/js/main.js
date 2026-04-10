document.addEventListener("DOMContentLoaded", () => {

    /* ═══════════════════════════════════════════
       PAGE LOADER
       ═══════════════════════════════════════════ */
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 800);
    });

    /* ═══════════════════════════════════════════
       NAVBAR — scroll shrink & active state
       ═══════════════════════════════════════════ */
    const nav = document.getElementById('main-nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 60);
        lastScroll = y;
    });

    /* ═══════════════════════════════════════════
       SCROLL PROGRESS BAR
       ═══════════════════════════════════════════ */
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrolled = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        progressBar.style.width = (scrolled / height * 100) + '%';
    });

    /* ═══════════════════════════════════════════
       SCROLL REVEAL — IntersectionObserver
       ═══════════════════════════════════════════ */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay || 0);
                setTimeout(() => entry.target.classList.add('active'), delay);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ═══════════════════════════════════════════
       SMOOTH INTERNAL LINKS
       ═══════════════════════════════════════════ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const id = this.getAttribute('href');
            if (id === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const target = document.querySelector(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ═══════════════════════════════════════════
       EMAIL COPY ON CLICK
       ═══════════════════════════════════════════ */
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = 'Sharathkumar2003.mca@email.com';
            navigator.clipboard.writeText(email).then(() => {
                const valueEl = emailLink.querySelector('.contact-value');
                const original = valueEl.textContent;
                valueEl.textContent = '✓ Copied to clipboard!';
                valueEl.style.color = '#10b981';
                setTimeout(() => {
                    valueEl.textContent = original;
                    valueEl.style.color = '';
                }, 2000);
            });
        });
    }

    /* ═══════════════════════════════════════════
       HERO PARTICLE CANVAS
       ═══════════════════════════════════════════ */
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: -1000, y: -1000 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                // Mouse repulsion
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.vx += (dx / dist) * force * 0.3;
                    this.vy += (dy / dist) * force * 0.3;
                }

                // Damping
                this.vx *= 0.99;
                this.vy *= 0.99;

                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
        }

        const count = Math.min(60, Math.floor(window.innerWidth / 25));
        for (let i = 0; i < count; i++) particles.push(new Particle());

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 160) {
                        const opacity = (1 - dist / 160) * 0.15;
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };
        animate();
    }

    /* ═══════════════════════════════════════════
       PROJECT CARD HOVER TILT (subtle)
       ═══════════════════════════════════════════ */
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-4px) perspective(800px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

});
