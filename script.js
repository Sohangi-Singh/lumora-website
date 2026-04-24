/* ==============================
   LUMORA SOLAR - IMMERSIVE WEBSITE JS
   ============================== */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

    // ===== PRELOADER =====
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = 'auto';
            initCounters();
        }, 2200);
    });

    // ===== THREE.JS HERO SCENE =====
    const canvas = document.getElementById('heroCanvas');
    const heroSection = document.getElementById('hero');
    const scene = new THREE.Scene();
    const heroW = heroSection.offsetWidth;
    const heroH = heroSection.offsetHeight;
    const camera = new THREE.PerspectiveCamera(60, heroW / heroH, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(heroW, heroH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const sunLight = new THREE.PointLight(0xf7a600, 2, 50);
    sunLight.position.set(5, 8, 5);
    scene.add(sunLight);
    const blueLight = new THREE.PointLight(0x1a6baa, 1.5, 40);
    blueLight.position.set(-5, 3, -3);
    scene.add(blueLight);

    // Create a sun sphere
    const sunGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
        color: 0xf7a600,
        transparent: true,
        opacity: 0.8
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(4, 4, -5);
    scene.add(sunMesh);

    // Sun glow — soft dissolved edges via canvas radial-gradient Sprite
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext('2d');
    const radGrad = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    radGrad.addColorStop(0,    'rgba(255, 215, 80, 0.55)');
    radGrad.addColorStop(0.25, 'rgba(247, 166,  0, 0.32)');
    radGrad.addColorStop(0.50, 'rgba(247, 166,  0, 0.13)');
    radGrad.addColorStop(0.75, 'rgba(247, 166,  0, 0.04)');
    radGrad.addColorStop(1,    'rgba(247, 166,  0, 0.00)');
    glowCtx.fillStyle = radGrad;
    glowCtx.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const glowMesh = new THREE.Sprite(glowMat);
    glowMesh.scale.set(7, 7, 1);
    glowMesh.position.copy(sunMesh.position);
    scene.add(glowMesh);

    // Solar panel grid
    const panelGroup = new THREE.Group();
    const panelMat = new THREE.MeshPhongMaterial({
        color: 0x1a6baa,
        shininess: 100,
        specular: 0x4488cc,
        transparent: true,
        opacity: 0.9
    });
    const frameMat = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 30 });

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
            // Panel cell
            const cellGeo = new THREE.BoxGeometry(0.55, 0.02, 0.55);
            const cell = new THREE.Mesh(cellGeo, panelMat);
            cell.position.set(col * 0.62 - 1.55, 0, row * 0.62 - 0.93);
            panelGroup.add(cell);

            // Grid lines
            const lineGeo = new THREE.BoxGeometry(0.58, 0.025, 0.01);
            const lineH = new THREE.Mesh(lineGeo, frameMat);
            lineH.position.set(col * 0.62 - 1.55, 0.01, row * 0.62 - 0.62);
            panelGroup.add(lineH);
        }
    }

    // Panel frame
    const frameGeoOuter = new THREE.BoxGeometry(3.9, 0.05, 2.7);
    const frameEdges = new THREE.EdgesGeometry(frameGeoOuter);
    const frameLine = new THREE.LineSegments(frameEdges, new THREE.LineBasicMaterial({ color: 0x555555 }));
    panelGroup.add(frameLine);

    panelGroup.scale.set(1.6, 1.6, 1.6);
    panelGroup.rotation.x = -0.5;
    panelGroup.rotation.y = 0.3;
    panelGroup.position.set(2.5, -0.8, 0);
    scene.add(panelGroup);

    // Floating particles (energy particles)
    const particlesCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const particlesPos = new Float32Array(particlesCount * 3);
    const particlesSpeeds = [];

    for (let i = 0; i < particlesCount; i++) {
        particlesPos[i * 3] = (Math.random() - 0.5) * 20;
        particlesPos[i * 3 + 1] = (Math.random() - 0.5) * 15;
        particlesPos[i * 3 + 2] = (Math.random() - 0.5) * 15;
        particlesSpeeds.push(0.005 + Math.random() * 0.015);
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));

    const particlesMat = new THREE.PointsMaterial({
        color: 0xf7a600,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Sun pulse
        const sunScale = 1 + Math.sin(time * 2) * 0.05;
        sunMesh.scale.set(sunScale, sunScale, sunScale);
        glowMesh.scale.set(sunScale * 7, sunScale * 7, 1);

        // Panel float
        panelGroup.position.y = -0.5 + Math.sin(time * 1.5) * 0.15;
        panelGroup.rotation.y = 0.3 + Math.sin(time * 0.8) * 0.05;

        // Particles float upward
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3 + 1] += particlesSpeeds[i];
            if (positions[i * 3 + 1] > 8) {
                positions[i * 3 + 1] = -8;
            }
            positions[i * 3] += Math.sin(time + i) * 0.002;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y = time * 0.05;

        // Camera subtle movement
        camera.position.x = Math.sin(time * 0.3) * 0.3;
        camera.position.y = 2 + Math.sin(time * 0.4) * 0.2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        const w = heroSection.offsetWidth;
        const h = heroSection.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    // ===== HERO PARTICLES (HTML) =====
    const heroParticles = document.getElementById('heroParticles');
    for (let i = 0; i < 65; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${2 + Math.random() * 4}px;
            height: ${2 + Math.random() * 4}px;
            background: ${Math.random() > 0.5 ? '#f7a600' : '#1a6baa'};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${0.2 + Math.random() * 0.4};
            animation: floatParticle ${8 + Math.random() * 12}s linear infinite;
            animation-delay: ${-Math.random() * 10}s;
        `;
        heroParticles.appendChild(particle);
    }

    // Add float animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes floatParticle {
            0% { transform: translate(0, 0) scale(1); opacity: 0; }
            10% { opacity: 0.5; }
            90% { opacity: 0.5; }
            100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}${50 + Math.random() * 100}px, -${200 + Math.random() * 300}px) scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);

    // ===== NAVBAR =====
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // ===== GSAP + SCROLLTRIGGER =====
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Reveal animations
    document.querySelectorAll('.reveal').forEach((el, i) => {
        const delay = parseFloat(el.dataset.delay) || 0;
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => {
                setTimeout(() => el.classList.add('revealed'), delay * 1000);
            }
        });
    });

    // Process line animation — CSS-variable driven, scrub-synced
    const processLine = document.getElementById('processLine');
    if (processLine) {
        const processSteps = document.querySelectorAll('.process-step');
        ScrollTrigger.create({
            trigger: '.process-timeline',
            start: 'top 72%',
            end:   'bottom 28%',
            scrub: 0.35,           // tight lag (seconds) — feels 1:1 with scroll
            onUpdate: (self) => {
                // Direct CSS-variable update — no DOM thrashing
                processLine.style.setProperty('--lp', self.progress);

                // Activate step circles as bar passes them
                processSteps.forEach((step, i) => {
                    const threshold = (i + 0.5) / processSteps.length;
                    step.classList.toggle('active', self.progress >= threshold);
                });
            }
        });
    }

    // Savings bar animation
    document.querySelectorAll('.savings-bar-fill').forEach(bar => {
        const percent = bar.dataset.percent;
        ScrollTrigger.create({
            trigger: bar,
            start: 'top 85%',
            onEnter: () => { bar.style.width = percent + '%'; }
        });
    });

    // Parallax effects
    gsap.utils.toArray('.parallax-bg').forEach(bg => {
        gsap.to(bg, {
            yPercent: -30,
            ease: 'none',
            scrollTrigger: {
                trigger: bg.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // Section titles parallax
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            y: 30,
            scrollTrigger: {
                trigger: title,
                start: 'top 90%',
                end: 'top 50%',
                scrub: 1
            }
        });
    });

    // ===== COUNTERS (first-load, eased) =====
    function initCounters() {
        document.querySelectorAll('.hero-stat-number').forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2200;
            let startTime = null;
            counter.textContent = '0';

            function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

            function tick(now) {
                if (!startTime) startTime = now;
                const t = Math.min((now - startTime) / duration, 1);
                counter.textContent = Math.floor(easeOutQuart(t) * target);
                if (t < 1) requestAnimationFrame(tick);
                else counter.textContent = target;
            }
            requestAnimationFrame(tick);
        });
    }

    // ===== FAQ ACCORDION =====
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
            });

            // Open clicked (if it wasn't already open)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: target, offsetY: 80 },
                    ease: 'power3.inOut'
                });
            }
        });
    });

    // ===== CONTACT FORM — Web3Forms =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn          = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;

            // Collect all form values
            const name    = document.getElementById('formName').value.trim();
            const phone   = document.getElementById('formPhone').value.trim();
            const email   = document.getElementById('formEmail').value.trim();
            const type    = document.getElementById('formType').value;
            const bill    = document.getElementById('formBill').value.trim();
            const message = document.getElementById('formMessage').value.trim();
            const accessKey = contactForm.querySelector('[name="access_key"]').value;

            // Loading state
            btn.disabled  = true;
            btn.innerHTML = '<span>Sending…</span>';
            btn.style.opacity = '0.75';

            let success = false;

            try {
                const res  = await fetch('https://api.web3forms.com/submit', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({
                        access_key:                  accessKey,
                        subject:                     'New Solar Quote Request – Lumora Solar',
                        from_name:                   'Lumora Solar Website',
                        'Full Name':                 name,
                        'Phone Number':              phone,
                        'Email Address':             email,
                        'Installation Type':         type,
                        'Monthly Electricity Bill':  bill  || '—',
                        'Message':                   message || '—',
                    }),
                });
                const data = await res.json();
                success = res.ok && data.success;
            } catch (_) { /* network error — fall through */ }

            if (success) {
                btn.innerHTML = '<span>✓ Request Sent!</span>';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                btn.style.opacity    = '1';
            } else {
                // Fallback: WhatsApp — lead is never lost
                const waText = encodeURIComponent(
                    `Hello Lumora Solar!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nInstallation Type: ${type}\nMonthly Bill: ${bill ? '₹' + bill : 'N/A'}\nMessage: ${message || 'N/A'}`
                );
                window.open(`https://wa.me/919981036737?text=${waText}`, '_blank');
                btn.innerHTML = '<span>✓ Sent via WhatsApp</span>';
                btn.style.background = 'linear-gradient(135deg, #25d366, #128c7e)';
                btn.style.opacity    = '1';
            }

            btn.disabled = false;
            setTimeout(() => {
                btn.innerHTML    = originalHTML;
                btn.style.background = '';
                btn.style.opacity    = '';
                contactForm.reset();
            }, 3500);
        });
    }

    // ===== TILT EFFECT ON CARDS =====
    document.querySelectorAll('.benefit-card, .system-card, .project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ===== MAGNETIC EFFECT ON CTA BUTTONS =====
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) translateY(-3px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ===== ACTIVE NAV LINK HIGHLIGHT =====
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', scrollY >= top && scrollY < top + height);
            }
        });
    });

    // Nav active style
    const navActiveStyle = document.createElement('style');
    navActiveStyle.textContent = `.nav-link.active { color: var(--accent) !important; }`;
    document.head.appendChild(navActiveStyle);

    // ===== FLOATING PARTICLES IN SECTIONS =====
    function addSectionParticles(sectionSelector, count, colors) {
        const section = document.querySelector(sectionSelector);
        if (!section) return;
        section.style.position = 'relative';
        section.style.overflow = 'hidden';
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            const size = 2 + Math.random() * 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            p.style.cssText = `
                position:absolute;
                width:${size}px;height:${size}px;
                background:${color};
                border-radius:50%;
                left:${Math.random()*100}%;
                top:${Math.random()*100}%;
                opacity:${0.1 + Math.random()*0.25};
                pointer-events:none;
                z-index:0;
                animation: sectionFloat ${10+Math.random()*15}s linear infinite;
                animation-delay: ${-Math.random()*10}s;
            `;
            section.appendChild(p);
        }
    }
    // Add particles CSS
    const particleStyle = document.createElement('style');
    particleStyle.textContent = `
        @keyframes sectionFloat {
            0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
            15% { opacity: 0.3; }
            85% { opacity: 0.3; }
            100% { transform: translateY(-200px) translateX(${Math.random()>0.5?'':'-'}60px) scale(0.5); opacity: 0; }
        }
    `;
    document.head.appendChild(particleStyle);

    addSectionParticles('#choose-us', 15, ['#f7a600','#ffc846','#1a6baa']);
    addSectionParticles('#systems', 12, ['#1a6baa','#2d8fd4','#10b981']);
    addSectionParticles('#faq', 10, ['#f7a600','#1a6baa']);
    addSectionParticles('#projects', 10, ['#f7a600','#ffc846']);

    // ===== GSAP STAGGER FOR CHOOSE CARDS =====
    gsap.utils.toArray('.choose-card').forEach((card, i) => {
        gsap.from(card, {
            y: 60,
            opacity: 0,
            rotateY: 15,
            duration: 0.8,
            delay: i * 0.08,
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
            }
        });
    });

    // ===== GSAP STAGGER FOR PRICING CARDS =====
    gsap.utils.toArray('.pricing-card').forEach((card, i) => {
        gsap.from(card, {
            scale: 0.85,
            opacity: 0,
            y: 40,
            duration: 0.7,
            delay: i * 0.1,
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
            }
        });
    });

    // ===== GSAP FOR SYSTEM CARDS =====
    gsap.utils.toArray('.system-card').forEach((card, i) => {
        gsap.from(card, {
            x: i === 0 ? -60 : i === 2 ? 60 : 0,
            y: 50,
            opacity: 0,
            duration: 0.9,
            delay: i * 0.15,
            scrollTrigger: {
                trigger: card,
                start: 'top 88%',
            }
        });
    });

    // ===== GSAP FOR PROJECT CARDS =====
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.from(card, {
            y: 40,
            opacity: 0,
            duration: 0.6,
            delay: (i % 4) * 0.1,
            scrollTrigger: {
                trigger: card,
                start: 'top 92%',
            }
        });
    });

    // ===== SILK BACKGROUND EFFECT (Why We Started) =====
    function initSilk(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;

        const vsSource = `
            attribute vec2 a_position;
            void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
        `;

        const fsSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;

            // Simplex-style noise
            vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                   -0.577350269189626, 0.024390243902439);
                vec2 i = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                         + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution;
                float t = u_time * 0.4;

                // Layered flowing silk noise
                float n1 = snoise(vec2(uv.x * 2.5 + t * 0.3, uv.y * 1.8 - t * 0.2)) * 0.5;
                float n2 = snoise(vec2(uv.x * 4.0 - t * 0.15, uv.y * 3.0 + t * 0.25)) * 0.3;
                float n3 = snoise(vec2(uv.x * 6.0 + t * 0.1, uv.y * 5.5 - t * 0.18)) * 0.2;
                float noise = n1 + n2 + n3;

                // Silk wave distortion
                float wave = sin(uv.x * 6.28 + noise * 3.0 + t) * 0.5 + 0.5;
                float silk = smoothstep(0.15, 0.85, wave + noise * 0.5);

                // Deep blue-purple base with amber solar accent
                vec3 darkBlue = vec3(0.04, 0.02, 0.14);
                vec3 deepPurple = vec3(0.08, 0.01, 0.22);
                vec3 solarAmber = vec3(0.35, 0.18, 0.0);

                vec3 color = mix(darkBlue, deepPurple, silk);
                color = mix(color, solarAmber, pow(silk, 3.0) * 0.35);

                // Soft highlight streaks
                float streak = pow(max(0.0, sin(uv.y * 12.0 + noise * 4.0 + t * 0.5)), 8.0);
                color += vec3(0.15, 0.06, 0.25) * streak * 0.6;

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vs = createShader(gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(program, 'a_position');
        const timeLoc = gl.getUniformLocation(program, 'u_time');
        const resLoc = gl.getUniformLocation(program, 'u_resolution');

        function resizeSilk() {
            const section = canvas.closest('section') || canvas.parentElement;
            if (!section) return;
            canvas.width  = section.offsetWidth;
            canvas.height = section.offsetHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        resizeSilk();
        window.addEventListener('resize', resizeSilk);

        let silkTime = 0;
        function renderSilk() {
            silkTime += 0.016;
            gl.useProgram(program);
            gl.enableVertexAttribArray(posLoc);
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(timeLoc, silkTime);
            gl.uniform2f(resLoc, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(renderSilk);
        }
        renderSilk();
    }

    // Init silk on all sections
    initSilk('silkCanvas');
    initSilk('chooseUsSilk');
    initSilk('faqSilk');
    initSilk('whySolarSilk');
    initSilk('systemsSilk');
    initSilk('projectsSilk');

    // ===== INFINITE MENU — 3D Projects Gallery =====
    (function initInfiniteMenu() {
        const wrap = document.getElementById('imWrap');
        const grid = document.getElementById('imGrid');
        if (!wrap || !grid) return;

        // Capture original items before any cloning
        const origItems = Array.from(grid.children);
        const COLS      = 3;
        const ROWS      = Math.ceil(origItems.length / COLS); // 4 rows
        const ITEM_H    = 195 + 16; // height + gap = 211px
        const TOTAL_H   = ROWS * ITEM_H; // 844px per full set

        // Build 3 sets: [top-clone] [original] [bottom-clone]
        // Prepend a copy above originals (for scrolling up)
        const topFrag = document.createDocumentFragment();
        origItems.forEach(item => topFrag.appendChild(item.cloneNode(true)));
        grid.insertBefore(topFrag, grid.firstChild);

        // Append a copy below originals (for scrolling down)
        origItems.forEach(item => grid.appendChild(item.cloneNode(true)));

        // Start showing the middle set (original items)
        let y       = -TOTAL_H;
        let targetY = y;
        let vel     = 0;
        let autoVel = -0.55;        // gentle continuous downward drift
        let isDragging   = false;
        let dragStartY   = 0;
        let dragStartTgt = 0;
        let lastDragY    = 0;
        let dragVel      = 0;
        let userActive   = false;   // true while user is interacting
        let userTimer    = null;

        function resumeAuto() {
            userActive = false;
        }

        function pauseAuto(ms) {
            userActive = true;
            clearTimeout(userTimer);
            userTimer = setTimeout(resumeAuto, ms || 2500);
        }

        grid.style.transform = `translateY(${y}px)`;

        function tick() {
            // Auto-drift when user isn't interacting
            if (!isDragging && !userActive) {
                vel += (autoVel - vel) * 0.04;   // ease vel toward autoVel
            } else if (!isDragging) {
                vel *= 0.90;                     // friction after drag fling
            }

            targetY += vel;
            y += (targetY - y) * 0.09;          // smooth lerp

            // Seamless wrap — keep y in the middle set's neighbourhood
            if (y < -(TOTAL_H * 2 + TOTAL_H * 0.5)) { y += TOTAL_H; targetY += TOTAL_H; }
            if (y > -(TOTAL_H * 0.5))               { y -= TOTAL_H; targetY -= TOTAL_H; }

            // Tilt the grid subtly based on speed (3D feel)
            const tilt = Math.max(-6, Math.min(6, vel * 1.4));
            grid.style.transform = `translateY(${y}px) rotateX(${tilt}deg)`;

            requestAnimationFrame(tick);
        }
        tick();

        // ── Mouse wheel — add momentum but keep auto-drift alive ──
        wrap.addEventListener('wheel', e => {
            e.preventDefault();
            vel += e.deltaY * 0.28;
            // no pauseAuto — gallery always drifts
        }, { passive: false });

        // ── Mouse drag ───────────────────────────────────────
        wrap.addEventListener('mousedown', e => {
            isDragging   = true;
            dragStartY   = e.clientY;
            dragStartTgt = targetY;
            lastDragY    = e.clientY;
            dragVel      = 0;
            vel          = 0;
            pauseAuto(4000);
        });
        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const dy = e.clientY - lastDragY;
            lastDragY = e.clientY;
            dragVel = dy;
            targetY = dragStartTgt + (e.clientY - dragStartY);
        });
        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            vel = dragVel * 1.3;     // fling momentum
            pauseAuto(1200);         // resume auto-drift after 1.2 s
        });

        // ── Touch ────────────────────────────────────────────
        wrap.addEventListener('touchstart', e => {
            isDragging   = true;
            dragStartY   = e.touches[0].clientY;
            dragStartTgt = targetY;
            lastDragY    = e.touches[0].clientY;
            dragVel      = 0;
            vel          = 0;
            pauseAuto(4000);
        }, { passive: true });
        wrap.addEventListener('touchmove', e => {
            if (!isDragging) return;
            const dy = e.touches[0].clientY - lastDragY;
            lastDragY = e.touches[0].clientY;
            dragVel = dy;
            targetY = dragStartTgt + (e.touches[0].clientY - dragStartY);
            e.preventDefault();
        }, { passive: false });
        wrap.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            vel = dragVel * 1.3;
            pauseAuto(1200);         // resume auto-drift after 1.2 s
        });
    })();

    // ===== ANIMATED BEAMS BACKGROUND (React Bits style) =====
    // 20 packed planes, additive blending, soft edge-fade per beam + Perlin noise + grain
    function initBeams(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const section = canvas.parentElement;

        // ---- Renderer: opaque black clear ----
        const beamRenderer = new THREE.WebGLRenderer({ canvas, antialias: false });
        beamRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        beamRenderer.setClearColor(0x000000, 1);

        // ---- Scene: pure black, no fog needed ----
        const beamScene = new THREE.Scene();
        beamScene.background = new THREE.Color(0x000000);

        // ---- Camera: fov=30, z=20 (matches PerspectiveCamera in React Bits) ----
        const beamCam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        beamCam.position.z = 20;

        // ---- Classic Perlin 3D noise GLSL (ported from React Bits noise string) ----
        const CNOISE = `
            vec4 _cp(vec4 x){return mod(((x*34.)+1.)*x,289.);}
            vec4 _ct(vec4 r){return 1.79284291400159-0.85373472095314*r;}
            vec3 _cf(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}
            float cnoise(vec3 P){
                vec3 Pi0=floor(P),Pi1=Pi0+1.;
                Pi0=mod(Pi0,289.);Pi1=mod(Pi1,289.);
                vec3 Pf0=fract(P),Pf1=Pf0-1.;
                vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
                vec4 iy=vec4(Pi0.yy,Pi1.yy);
                vec4 iz0=Pi0.zzzz,iz1=Pi1.zzzz;
                vec4 ixy=_cp(_cp(ix)+iy);
                vec4 ixy0=_cp(ixy+iz0),ixy1=_cp(ixy+iz1);
                vec4 gx0=ixy0/7.,gy0=fract(floor(gx0)/7.)-.5;gx0=fract(gx0);
                vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0),sz0=step(gz0,vec4(0.));
                gx0-=sz0*(step(0.,gx0)-.5);gy0-=sz0*(step(0.,gy0)-.5);
                vec4 gx1=ixy1/7.,gy1=fract(floor(gx1)/7.)-.5;gx1=fract(gx1);
                vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1),sz1=step(gz1,vec4(0.));
                gx1-=sz1*(step(0.,gx1)-.5);gy1-=sz1*(step(0.,gy1)-.5);
                vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y);
                vec3 g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w);
                vec3 g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y);
                vec3 g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);
                vec4 n0=_ct(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
                g000*=n0.x;g010*=n0.y;g100*=n0.z;g110*=n0.w;
                vec4 n1=_ct(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
                g001*=n1.x;g011*=n1.y;g101*=n1.z;g111*=n1.w;
                float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.x,Pf0.yz));
                float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),n110=dot(g110,vec3(Pf1.xy,Pf0.z));
                float n001=dot(g001,vec3(Pf0.xy,Pf1.z)),n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
                float n011=dot(g011,vec3(Pf0.x,Pf1.yz)),n111=dot(g111,Pf1);
                vec3 fxyz=_cf(Pf0);
                vec4 nz=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fxyz.z);
                vec2 nyz=mix(nz.xy,nz.zw,fxyz.y);
                return 2.2*mix(nyz.x,nyz.y,fxyz.x);
            }
        `;

        // ---- Additive shader: each plane glows from its centre, fades at edges ----
        const beamMat = new THREE.ShaderMaterial({
            uniforms: {
                time:            { value: 0 },
                uSpeed:          { value: 1.5 },
                uNoiseIntensity: { value: 1.5 },
                uScale:          { value: 0.18 },
            },
            vertexShader: `
                attribute float localX;
                varying  float vLocalX;
                varying  vec2  vUv;
                uniform float time, uSpeed, uNoiseIntensity, uScale;
                ${CNOISE}
                void main(){
                    vUv     = uv;
                    vLocalX = localX;
                    vec3 pos = position;
                    float n = cnoise(vec3(uv * uScale, time * uSpeed * 0.3));
                    pos.z += n * uNoiseIntensity;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying float vLocalX;
                varying vec2  vUv;
                uniform float uNoiseIntensity, time, uSpeed;
                float rnd(vec2 st){ return fract(sin(dot(st,vec2(12.9898,78.233)))*43758.5453); }
                float vnoise(vec2 st){
                    vec2 i=floor(st),f=fract(st);
                    float a=rnd(i),b=rnd(i+vec2(1.,0.)),c=rnd(i+vec2(0.,1.)),d=rnd(i+vec2(1.,1.));
                    vec2 u=f*f*(3.-2.*f);
                    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
                }
                void main(){
                    // Soft bell-curve fade: 0 at edges → 1 at centre
                    float edge = smoothstep(0.0, 0.4, vLocalX) * smoothstep(1.0, 0.6, vLocalX);
                    // Per-beam brightness variation (each beam has a unique UV.x seed)
                    float planeB = 0.45 + vnoise(vec2(vUv.x * 0.003, time * uSpeed * 0.06)) * 0.55;
                    // Animated light/dark bands flowing up the beam
                    float bands = vnoise(vec2(vUv.x * 0.005, vUv.y * 0.4 - time * uSpeed * 0.28));
                    // Screen grain
                    float grain = vnoise(gl_FragCoord.xy * 0.5);
                    // Keep beams dim — majority of background stays black
                    float b = edge * planeB * (0.18 + bands * 0.38);
                    b = max(b - grain * 0.015 * uNoiseIntensity, 0.0);
                    gl_FragColor = vec4(vec3(b), 1.0);
                }
            `,
            transparent: true,
            blending:    THREE.AdditiveBlending,
            depthWrite:  false,
            side:        THREE.DoubleSide,
        });

        // ---- Geometry: variable-width planes, each [xOffset, width] pair ----
        function buildPlanes(planesArr, h, hSegs) {
            const n   = planesArr.length;
            const geo = new THREE.BufferGeometry();
            const nV  = n * (hSegs + 1) * 2;
            const nF  = n * hSegs * 2;
            const pos = new Float32Array(nV * 3);
            const idx = new Uint32Array(nF * 3);
            const uv  = new Float32Array(nV * 2);
            const lx  = new Float32Array(nV);
            let vi=0, ii=0, ui=0;
            // Centre the span
            const minX = Math.min(...planesArr.map(([x])    => x));
            const maxX = Math.max(...planesArr.map(([x, w]) => x + w));
            const cx   = -(minX + maxX) / 2;
            for (const [xo, pw] of planesArr) {
                const x0 = xo + cx;
                const ux = Math.random() * 300;
                const uy = Math.random() * 300;
                for (let j = 0; j <= hSegs; j++) {
                    const y = h * (j / hSegs - 0.5);
                    pos.set([x0, y, 0, x0 + pw, y, 0], vi * 3);
                    const v = j / hSegs;
                    uv.set([ux, v + uy, ux + 1, v + uy], ui);
                    lx[vi] = 0;  lx[vi + 1] = 1;
                    if (j < hSegs) {
                        const a=vi, b=vi+1, c=vi+2, d=vi+3;
                        idx.set([a,b,c,c,b,d], ii);
                        ii += 6;
                    }
                    vi += 2; ui += 4;
                }
            }
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('uv',       new THREE.BufferAttribute(uv,  2));
            geo.setAttribute('localX',   new THREE.BufferAttribute(lx,  1));
            geo.setIndex(new THREE.BufferAttribute(idx, 1));
            return geo;
        }

        // ---- Group, mesh, dynamic geometry ----
        const group = new THREE.Group();
        group.rotation.z = 30 * (Math.PI / 180);
        beamScene.add(group);
        const mesh = new THREE.Mesh(new THREE.BufferGeometry(), beamMat);
        group.add(mesh);

        function rebuildPlanes() {
            const vH   = 2 * Math.tan(beamCam.fov * Math.PI / 360) * beamCam.position.z;
            const vW   = vH * beamCam.aspect;
            const ph   = vH * 2.5;
            const span = vW * 3.0;   // beams spread across 3× view width

            // 7 beams: each beam gets a random width (thin to thick) and a random gap before it
            const nBeams = 7;
            const planes = [];
            let cursor = -span / 2;
            for (let i = 0; i < nBeams; i++) {
                // gap: 20–50% of span/nBeams
                cursor += (span / nBeams) * (0.2 + Math.random() * 0.3);
                // width: 4–18% of view width → thin or thick
                const w = vW * (0.04 + Math.random() * 0.14);
                planes.push([cursor, w]);
                cursor += w;
            }

            const old = mesh.geometry;
            mesh.geometry = buildPlanes(planes, ph, 100);
            old.dispose();
        }

        function onResize() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            // false = don't override CSS — canvas fills section via stylesheet
            beamRenderer.setSize(w, h, false);
            beamCam.aspect = w / h;
            beamCam.updateProjectionMatrix();
            rebuildPlanes();
        }

        onResize();
        setTimeout(onResize, 200);
        window.addEventListener('resize', onResize);

        // ---- Render loop — time advances at 1 unit/sec so movement is clearly visible ----
        let prev = performance.now();
        (function loop() {
            const now  = performance.now();
            const dt   = Math.min((now - prev) / 1000, 0.05); // cap delta to avoid big jumps
            prev = now;
            beamMat.uniforms.time.value += dt;
            beamRenderer.render(beamScene, beamCam);
            requestAnimationFrame(loop);
        })();
    }

    initBeams('chooseUsBeams');
    initBeams('faqBeams');

    // ===== ALSO INCLUDED — SELF-INCREASING GLOWING PROGRESS BAR =====
    (function initIncludedProgress() {
        const progressBar = document.getElementById('includedProgress');
        const fill        = document.getElementById('includedFill');
        const steps       = document.querySelectorAll('.included-step');
        if (!progressBar || !fill || !steps.length) return;

        // Each step lights up as the bar sweeps through its position.
        // With 5 evenly-spaced steps the centres fall at 0%, 25%, 50%, 75%, 100%
        // of the track width.  We trigger each step slightly before the bar tip
        // reaches it so the glow appears to "arrive" at the dot.
        const stepThresholds = [0, 25, 50, 75, 100]; // % of fill when step activates

        let played = false;

        ScrollTrigger.create({
            trigger: progressBar,
            start: 'top 80%',
            onEnter: () => { if (!played) { played = true; runProgress(); } },
            onEnterBack: () => { if (!played) { played = true; runProgress(); } }
        });

        function runProgress() {
            // Reset
            fill.style.transition = 'none';
            fill.style.width = '0%';
            steps.forEach(s => s.classList.remove('active'));

            // Animate fill over 2.6 s, activating steps along the way
            const duration = 2600; // ms
            const startTime = performance.now();

            function tick(now) {
                const elapsed  = now - startTime;
                const progress = Math.min(elapsed / duration, 1); // 0 → 1
                const pct      = progress * 100;

                fill.style.transition = 'none';
                fill.style.width = pct + '%';

                // Activate steps whose threshold has been reached
                steps.forEach((step, i) => {
                    if (pct >= stepThresholds[i]) {
                        step.classList.add('active');
                    }
                });

                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    // Ensure everything is fully active at the end
                    fill.style.width = '100%';
                    steps.forEach(s => s.classList.add('active'));
                }
            }

            requestAnimationFrame(tick);
        }

        // Replay when scrolled back into view (optional: remove if single-play preferred)
        ScrollTrigger.create({
            trigger: progressBar,
            start: 'top 90%',
            onLeaveBack: () => {
                played = false;
                fill.style.transition = 'none';
                fill.style.width = '0%';
                steps.forEach(s => s.classList.remove('active'));
            }
        });
    })();

    // ===== TASK 1: COUNTER — REPLAY ON HERO RE-ENTRY =====
    (function initHeroCounters() {
        const heroEl = document.getElementById('hero');
        if (!heroEl) return;

        function runCounters() {
            document.querySelectorAll('.hero-stat-number').forEach(counter => {
                const target = parseInt(counter.dataset.count);
                const duration = 2200;
                let startTime = null;
                counter.textContent = '0';

                function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

                function tick(now) {
                    if (!startTime) startTime = now;
                    const t = Math.min((now - startTime) / duration, 1);
                    counter.textContent = Math.floor(easeOutQuart(t) * target);
                    if (t < 1) requestAnimationFrame(tick);
                    else counter.textContent = target;
                }
                requestAnimationFrame(tick);
            });
        }

        // First run is already called via initCounters() on load.
        // Re-run every time hero scrolls back into view.
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) runCounters(); });
        }, { threshold: 0.3 });
        obs.observe(heroEl);
    })();

    // ===== TASK 3: WHY-SOLAR FLOATING Q-MARKS + PARTICLES =====
    (function initWhySolarBg() {
        const section = document.getElementById('why-solar');
        if (!section) return;

        const wrap = document.createElement('div');
        wrap.className = 'why-solar-particles';
        section.prepend(wrap);

        const sizes   = [28, 36, 44, 52, 60, 72];
        const opacs   = [0.06, 0.08, 0.10, 0.12];
        const qTotal  = 18;
        const dotTotal = 30;

        for (let i = 0; i < qTotal; i++) {
            const q = document.createElement('span');
            q.className = 'wsp-qmark';
            q.textContent = '?';
            const sz  = sizes[i % sizes.length];
            const dur = 14 + Math.random() * 18;
            const del = -Math.random() * dur;
            const op  = opacs[Math.floor(Math.random() * opacs.length)];
            q.style.cssText = `
                left: ${Math.random() * 95}%;
                top: ${100 + Math.random() * 30}%;
                font-size: ${sz}px;
                color: rgba(247,166,0,${op});
                animation-duration: ${dur}s;
                animation-delay: ${del}s;
            `;
            wrap.appendChild(q);
        }

        for (let i = 0; i < dotTotal; i++) {
            const d = document.createElement('span');
            d.className = 'wsp-dot';
            const sz  = 2 + Math.random() * 5;
            const dur = 10 + Math.random() * 20;
            const del = -Math.random() * dur;
            d.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${100 + Math.random() * 20}%;
                width: ${sz}px; height: ${sz}px;
                opacity: ${0.06 + Math.random() * 0.12};
                animation-duration: ${dur}s;
                animation-delay: ${del}s;
            `;
            wrap.appendChild(d);
        }
    })();

    // ===== TASK 6: INCREASE HERO PARTICLE FREQUENCY =====
    // (Hero HTML particles already injected above — increase 3-js count)
    // Bump THREE.js particles density (already at 200 — handled at init time)
    // Add more HTML overlay particles to existing heroParticles container
    (function boostHeroParticles() {
        const hp = document.getElementById('heroParticles');
        if (!hp) return;
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: absolute;
                width: ${1.5 + Math.random() * 3}px;
                height: ${1.5 + Math.random() * 3}px;
                background: ${Math.random() > 0.6 ? '#f7a600' : Math.random() > 0.5 ? '#1a6baa' : '#fff'};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${0.15 + Math.random() * 0.35};
                animation: floatParticle ${6 + Math.random() * 14}s linear infinite;
                animation-delay: ${-Math.random() * 12}s;
            `;
            hp.appendChild(p);
        }
    })();

    // ===== TASK 8: VIDEO — smooth forward loop + parallax =====
    (function initVideoSection() {
        const vid     = document.getElementById('solarVid');
        const section = document.getElementById('solar-vid');
        if (!vid || !section) return;

        // Ensure autoplay fires even on low-power mode browsers
        vid.play().catch(() => {});

        // Subtle parallax drift as user scrolls past
        gsap.to(vid, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    })();

});
