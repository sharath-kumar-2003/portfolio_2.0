document.addEventListener("DOMContentLoaded", () => {

    /* ═══════════════════════════════════════════
       THEME SWITCHER & DYNAMIC BACKGROUND
       ═══════════════════════════════════════════ */
    const htmlEl = document.documentElement;
    const themeSwitcher = document.getElementById('themeSwitcher');
    const themeFlash = document.getElementById('themeFlash');
    const starsLayer = document.getElementById('starsLayer');

    if (starsLayer) {
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            const size = Math.random() * 2 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
            star.style.animationDelay = `${Math.random() * 5}s`;
            starsLayer.appendChild(star);
        }
    }

    const savedTheme = localStorage.getItem('divine-theme');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        htmlEl.setAttribute('data-theme', prefersDark ? 'moonlight' : 'sunlight');
    }

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const current = htmlEl.getAttribute('data-theme');
            const nextTheme = current === 'sunlight' ? 'moonlight' : 'sunlight';
            
            if (themeFlash) {
                themeFlash.classList.remove('active');
                void themeFlash.offsetWidth; // trigger reflow
                themeFlash.classList.add('active');
            }
            
            htmlEl.setAttribute('data-theme', nextTheme);
            localStorage.setItem('divine-theme', nextTheme);
            
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: nextTheme } }));
        });
    }

    /* ═══════════════════════════════════════════
       PAGE LOADER
       ═══════════════════════════════════════════ */
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 1000);
    });

    /* ═══════════════════════════════════════════
       NAVBAR — scroll shrink & active state
       ═══════════════════════════════════════════ */
    const nav = document.getElementById('main-nav');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* ═══════════════════════════════════════════
       MOBILE HAMBURGER MENU
       ═══════════════════════════════════════════ */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

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
       SPLIT TEXT — Hero Title Character Reveal
       ═══════════════════════════════════════════ */
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        const lines = heroTitle.querySelectorAll('.line');
        let charIndex = 0;

        lines.forEach(line => {
            const text = line.dataset.text || line.textContent;
            // Keep the blink cursor if present
            const blink = line.querySelector('.blink');
            
            // Clear and rebuild
            line.textContent = '';
            
            for (let i = 0; i < text.length; i++) {
                const span = document.createElement('span');
                span.classList.add('char');
                span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
                span.style.animationDelay = `${0.6 + charIndex * 0.035}s`;
                line.appendChild(span);
                charIndex++;
            }

            // Re-add blink cursor
            if (blink) {
                line.appendChild(blink);
            }
        });
    }

    /* ═══════════════════════════════════════════
       STAT COUNTER ANIMATION
       ═══════════════════════════════════════════ */
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    let statsCounted = false;

    const countUp = (el) => {
        const target = parseInt(el.dataset.count);
        const duration = 1500;
        const start = performance.now();

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out expo
            const eased = 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.floor(target * eased) + '+';
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsCounted) {
                statsCounted = true;
                statNumbers.forEach(el => countUp(el));
            }
        });
    }, { threshold: 0.5 });

    if (statNumbers.length > 0) {
        statsObserver.observe(statNumbers[0].closest('.hero-stats'));
    }

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
    }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger, .reveal-clip, .reveal-scale').forEach(el => {
        revealObserver.observe(el);
    });

    /* ═══════════════════════════════════════════
       ACTIVE NAV — Morphing Pill
       ═══════════════════════════════════════════ */
    const navLinks = document.querySelectorAll('.nav-link');
    const navPill = document.querySelector('.nav-pill');
    const sections = document.querySelectorAll('section[id], footer[id]');

    const updateNavPill = (activeLink) => {
        if (!navPill || !activeLink) return;
        const rect = activeLink.getBoundingClientRect();
        const parentRect = activeLink.parentElement.getBoundingClientRect();
        navPill.style.left = (rect.left - parentRect.left) + 'px';
        navPill.style.width = rect.width + 'px';
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('is-active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('is-active');
                        updateNavPill(link);
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => sectionObserver.observe(section));

    // On hover, move pill temporarily
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => updateNavPill(link));
        link.addEventListener('mouseleave', () => {
            const active = document.querySelector('.nav-link.is-active');
            if (active) updateNavPill(active);
        });
    });

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
       ★ 3D CAROUSEL CONTROLLER ★
       ═══════════════════════════════════════════ */
    const carousel = document.getElementById('carousel-slider');
    const carouselScene = document.getElementById('carousel-scene');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');

    if (carousel) {
        const items = carousel.querySelectorAll('.carousel-item');
        const quantity = items.length;
        const angleStep = 360 / quantity;
        let currentAngle = 0;
        let currentIndex = 0;
        let autoRotateTimer;
        let isDragging = false;
        let startX = 0;
        let dragAngle = 0;

        const rotateCarousel = (angle, index) => {
            currentAngle = angle;
            currentIndex = ((index % quantity) + quantity) % quantity;
            carousel.style.setProperty('--carousel-angle', `${currentAngle}deg`);
            updateDots();
        };

        const updateDots = () => {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
        };

        // Auto-rotate — medium pace (8 seconds per rotation step)
        const startAutoRotate = () => {
            stopAutoRotate();
            autoRotateTimer = setInterval(() => {
                rotateCarousel(currentAngle - angleStep, currentIndex + 1);
            }, 4000);
        };

        const stopAutoRotate = () => {
            clearInterval(autoRotateTimer);
        };

        // Button controls
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                rotateCarousel(currentAngle + angleStep, currentIndex - 1);
                stopAutoRotate();
                startAutoRotate();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                rotateCarousel(currentAngle - angleStep, currentIndex + 1);
                stopAutoRotate();
                startAutoRotate();
            });
        }

        // Dot controls
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    const targetIndex = parseInt(dot.dataset.index);
                    const diff = targetIndex - currentIndex;
                    rotateCarousel(currentAngle - (diff * angleStep), targetIndex);
                    stopAutoRotate();
                    startAutoRotate();
                });
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                rotateCarousel(currentAngle + angleStep, currentIndex - 1);
                stopAutoRotate();
                startAutoRotate();
            } else if (e.key === 'ArrowRight') {
                rotateCarousel(currentAngle - angleStep, currentIndex + 1);
                stopAutoRotate();
                startAutoRotate();
            }
        });

        // Pause on hover
        carouselScene.addEventListener('mouseenter', stopAutoRotate);
        carouselScene.addEventListener('mouseleave', startAutoRotate);

        // Drag to rotate
        carouselScene.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            dragAngle = currentAngle;
            carouselScene.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dragAmt = dx * 0.3;
            carousel.style.setProperty('--carousel-angle', `${dragAngle + dragAmt}deg`);
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            carouselScene.style.cursor = '';
            const dx = e.clientX - startX;
            const dragAmt = dx * 0.3;
            const finalAngle = dragAngle + dragAmt;
            // Snap to nearest item
            const snappedAngle = Math.round(finalAngle / angleStep) * angleStep;
            const snappedIndex = Math.round(-snappedAngle / angleStep) % quantity;
            rotateCarousel(snappedAngle, ((snappedIndex % quantity) + quantity) % quantity);
            startAutoRotate();
        });

        // Touch support
        carouselScene.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            dragAngle = currentAngle;
            stopAutoRotate();
        }, { passive: true });

        carouselScene.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const dx = e.touches[0].clientX - startX;
            const dragAmt = dx * 0.3;
            carousel.style.setProperty('--carousel-angle', `${dragAngle + dragAmt}deg`);
        }, { passive: true });

        carouselScene.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const dx = e.changedTouches[0].clientX - startX;
            const dragAmt = dx * 0.3;
            const finalAngle = dragAngle + dragAmt;
            const snappedAngle = Math.round(finalAngle / angleStep) * angleStep;
            const snappedIndex = Math.round(-snappedAngle / angleStep) % quantity;
            rotateCarousel(snappedAngle, ((snappedIndex % quantity) + quantity) % quantity);
            startAutoRotate();
        });

        // Start auto-rotation
        startAutoRotate();
    }

    /* ═══════════════════════════════════════════
       MAGNETIC BUTTONS
       ═══════════════════════════════════════════ */
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.5s var(--ease-spring)';
            setTimeout(() => { el.style.transition = ''; }, 500);
        });

        // Ripple on click
        el.addEventListener('click', (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--ripple-x', `${e.clientX - rect.left}px`);
            el.style.setProperty('--ripple-y', `${e.clientY - rect.top}px`);
            el.classList.add('ripple');
            setTimeout(() => el.classList.remove('ripple'), 600);
        });
    });

    /* ═══════════════════════════════════════════
       3D CARD TILT — Bento Cards
       ═══════════════════════════════════════════ */
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateZ(8px)`;
            
            // Update glare position
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--glare-x', `${glareX}%`);
            card.style.setProperty('--glare-y', `${glareY}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.6s var(--ease-out-expo)';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    /* ═══════════════════════════════════════════
       HERO PARTICLE CANVAS — Enhanced
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
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.radius = Math.random() * 1.8 + 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
                
                const isSunlight = document.documentElement.getAttribute('data-theme') === 'sunlight';
                this.hue = isSunlight ? 40 + Math.random() * 15 : 225 + Math.random() * 15;
            }
            update() {
                // Mouse interaction
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.vx += (dx / dist) * force * 0.2;
                    this.vy += (dy / dist) * force * 0.2;
                }

                // Damping
                this.vx *= 0.992;
                this.vy *= 0.992;

                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
        }

        const count = Math.min(80, Math.floor(window.innerWidth / 20));
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
                    if (dist < 180) {
                        const opacity = (1 - dist / 180) * 0.12;
                        const isSunlight = document.documentElement.getAttribute('data-theme') === 'sunlight';
                        ctx.strokeStyle = isSunlight ? `rgba(200, 149, 46, ${opacity})` : `rgba(139, 159, 212, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles with glow
            particles.forEach(p => {
                // Outer glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity * 0.08})`;
                ctx.fill();
                
                // Core
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };
        
        window.addEventListener('themeChanged', () => {
            particles.forEach(p => p.reset());
        });

        animate();
    }

    /* ═══════════════════════════════════════════
       PARALLAX DEPTH — Background Orbs
       ═══════════════════════════════════════════ */
    const orbs = document.querySelectorAll('.gradient-orb');
    
    if (orbs.length > 0 && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            
            orbs.forEach((orb, i) => {
                const depth = (i + 1) * 15;
                orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
            });
        });
    }

    /* ═══════════════════════════════════════════
       SMOOTH SCROLL — Inertia Feel
       ═══════════════════════════════════════════ */
    // Use native smooth scroll with enhanced behavior
    // Add scroll-based parallax for sections
    const parallaxSections = document.querySelectorAll('.section-header');
    
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            parallaxSections.forEach(header => {
                const rect = header.getBoundingClientRect();
                const visible = rect.top < window.innerHeight && rect.bottom > 0;
                if (visible) {
                    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    header.style.transform = `translateY(${(1 - progress) * -20}px)`;
                    header.style.opacity = Math.min(1, progress * 1.5);
                }
            });
        });
    }

});
