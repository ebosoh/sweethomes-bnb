document.addEventListener('DOMContentLoaded', () => {

    /* --- Navigation & Scroll --- */
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Sticky Navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.style.background = 'rgba(10, 25, 47, 0.95)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.background = 'var(--glass-bg)';
        }
    });

    // Mobile Menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active');
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    /* --- Typewriter Effect --- */
    const textElement = document.getElementById('typewriter');
    const words = ["We build", "We automate", "We predict", "We transform"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }
    type();

    /* --- Stats Counter Animation --- */
    const statsSection = document.querySelector('.about-stats');
    const statNumbers = document.querySelectorAll('.stat-number');
    let started = false;

    const statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !started) {
            statNumbers.forEach(num => {
                const target = +num.getAttribute('data-target');
                const duration = 2000; // ms
                const increment = target / (duration / 16); // 60fps

                let current = 0;
                const updateCount = () => {
                    current += increment;
                    if (current < target) {
                        num.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCount);
                    } else {
                        num.innerText = target;
                    }
                };
                updateCount();
            });
            started = true;
        }
    });
    statsObserver.observe(statsSection);

    /* --- Services Carousel (Infinite Auto-Scroll) --- */
    const servicesTrack = document.getElementById('services-track');
    // Clone children for infinite seamless loop
    const serviceCards = Array.from(servicesTrack.children);
    serviceCards.forEach(card => {
        const clone = card.cloneNode(true);
        servicesTrack.appendChild(clone);
    });

    // JS animation for smoother control than CSS keyframes on dynamic widths
    let scrollPos = 0;
    const speed = 1; // Pixels per frame

    function animateServices() {
        scrollPos += speed;
        // If we've scrolled past the first set of cards, reset to 0
        // We assume the track is now double length. Reset when half is scrolled.
        if (scrollPos >= servicesTrack.scrollWidth / 2) {
            scrollPos = 0;
        }
        servicesTrack.style.transform = `translateX(-${scrollPos}px)`;
        requestAnimationFrame(animateServices);
    }
    animateServices();


    /* --- Client Carousel --- */
    const track = document.getElementById('client-track');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('next-slide');
    const prevBtn = document.getElementById('prev-slide');
    let currentSlideIndex = 0;

    function updateSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateSlide(currentSlideIndex);
    }

    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateSlide(currentSlideIndex);
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Auto rotate
    setInterval(nextSlide, 5000);

    /* ---// Booking Form Handling
const bookingForm = document.getElementById('booking-form');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close-modal');

if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            company: document.getElementById('company').value,
            email: document.getElementById('email').value,
            service: document.getElementById('service').value,
            date: document.getElementById('date').value,
            message: document.getElementById('message').value
        };

        const submitBtn = bookingForm.querySelector('button');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        // Replace this URL with your deployed Web App URL
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzRpBu0c_K7FJJCEvkpjKB54idI-WTflsxSF7lnIDQZbnEp7UFELDtXgEjQRzOw0AM/exec';

        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', // Important for GAS Web Apps if not using strict CORS headers setup
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            // Reset form
            bookingForm.reset();
            // Show Success Modal
            modal.style.display = 'flex';
            
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error!', error.message);
            // Fallback for demo purposes even if fetch fails due to 'no-cors' opacity or invalid URL
            modal.style.display = 'flex';
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        });
    });
}
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    /* --- Particle Background (Canvas) --- */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1; // Velocity
            this.vy = (Math.random() - 0.5) * 1;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce screen edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.fillStyle = 'rgba(0, 255, 204, 0.5)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numParticles = Math.min(width < 768 ? 50 : 100, 150);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Draw connections
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 180, 216, ${1 - distance / 150})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    /* --- Service Detail Modal Logic --- */
    const serviceModal = document.getElementById('service-modal');
    const closeServiceModal = document.querySelector('.close-modal-service');
    const modalImage = document.getElementById('modal-service-image');
    const modalTitle = document.getElementById('modal-service-title');
    const modalDesc = document.getElementById('modal-service-description');

    // Service Data with African Themed AI Illustrations
    const serviceData = {
        'nlp': {
            title: 'NLP Solutions',
            description: `<p><strong>Unlock the Power of Language.</strong> Our Natural Language Processing (NLP) solutions go beyond simple chatbots. We build intelligent systems that understand context, sentiment, and intent in real-time.</p>
                          <p>Imagine a customer support system that handles 80% of inquiries automatically, or a legal analysis tool that scans thousands of compliance documents in seconds. Our NLP agents can draft emails, summarize meetings, and even translate local dialects to bridge communication gaps across Africa.</p>`,
            image: 'ecommerce_support_ai_african_1767033018478.png'
        },

        'booking': {
            title: 'Booking Conversational AI',
            description: `<p><strong>24/7 Intelligent Scheduling.</strong> Automate appointment booking with our advanced conversational AI that handles voice and text interactions seamlessly.</p>
                          <p>A medical clinic reduced admin time by 60% using our Appointment Bot (pictured). It negotiates times, sends reminders, and syncs with doctors' calendars 24/7, ensuring no slot is wasted and patients are always seen on time.</p>`,
            image: 'african_receptionist_robot.png'
        },

        'chatbots': {
            title: 'AI Chatbots',
            description: `<p><strong>Intelligent Customer Engagement.</strong> Deploy conversational AI agents that understand context, provide instant answers, and deliver exceptional customer experiences around the clock.</p>
                          <p>Our AI chatbots handle customer inquiries, product recommendations, troubleshooting, and support tickets with human-like understanding. They learn from every interaction, integrate with your existing systems, and can escalate complex issues to human agents when needed. Reduce response times from hours to seconds while maintaining a personal touch.</p>`,
            image: 'ai_chatbot_interface.png'
        },

        'webapps': {
            title: 'Web Applications',
            description: `<p><strong>Next-Gen Digital Platforms.</strong> We don't just build websites; we build powerful, scalable web applications that run your business logic in the cloud.</p>
                          <p>Whether it's a fintech dashboard, a telemedicine portal, or an e-learning platform, our web apps are built with modern frameworks (React/Next.js) for speed, security, and scalability. Provide your users with a app-like experience directly in their browser.</p>`,
            image: 'kenya_semiconductors_webapp.png'
        },
        'websites': {
            title: 'Business Websites',
            description: `<p><strong>Your Digital Headquarters.</strong> In the digital age, your website is your most important asset. We create stunning, high-performance websites that convert visitors into clients.</p>
                          <p>A professional website establishes trust. We use modern design principles (Glassmorphism, 3D elements) to ensure you stand out from competitors. Our sites are SEO-optimized, mobile-responsive, and integrated with your CRM for lead capture.</p>`,
            image: 'africa_fintech_website.png'
        },

        'social': {
            title: 'Social Media Autopilot',
            description: `<p><strong>Engage Everywhere, Instantly.</strong> Manage your brand presence across all platforms with a single AI agent.</p>
                          <p>Our Social Media Autopilot doesn't just post; it replies to comments, engages with trends, and analyzes sentiment. It's like having a dedicated 24/7 social media manager that ensures your brand voice is always active and relevant.</p>`,
            image: 'social_media_ai_dashboard.png'
        },

        'agent': {
            title: 'Custom AI Agents',
            description: `<p><strong>Your Dedicated Digital Workforce.</strong> Need a specialized solution? We build custom AI agents trained on your specific data and workflows.</p>
                          <p>From internal HR bots to complex supply chain predictors, we design the "brain" of your operation. These agents learn from your processes and improve over time, becoming an indispensable asset to your company.</p>`,
            image: 'collaborative_ai_agents.png'
        }
    };

    // Attach Click Listeners
    document.querySelectorAll('.service-card').forEach(card => {
        const titleElement = card.querySelector('h3');
        if (!titleElement) return;

        const title = titleElement.innerText;
        const btn = card.querySelector('.learn-more');

        let key = '';
        if (title.includes('NLP')) key = 'nlp';
        else if (title.includes('Booking')) key = 'booking';
        else if (title.includes('Chatbot')) key = 'chatbots';

        else if (title.includes('Web App')) key = 'webapps';
        else if (title.includes('Business Web')) key = 'websites';

        else if (title.includes('Social')) key = 'social';

        else if (title.includes('Agent')) key = 'agent';
        else if (title.includes('Other')) key = 'agent'; // Fallback

        if (key) {
            // Make the entire card clickable
            card.style.cursor = 'pointer'; // Ensure JS enforces it too
            card.addEventListener('click', (e) => {
                // Prevent default anchor behavior if they clicked the button inside
                if (e.target.tagName === 'A') e.preventDefault();
                openServiceModal(key);
            });
        }
    });

    function openServiceModal(key) {
        const data = serviceData[key];
        if (!data) return;

        if (modalTitle) modalTitle.innerText = data.title;
        if (modalDesc) modalDesc.innerHTML = data.description;
        if (modalImage) modalImage.src = data.image;

        if (serviceModal) {
            serviceModal.style.display = 'flex';
            // Trigger reflow
            serviceModal.offsetHeight;
            serviceModal.classList.add('show');
        }
    }

    if (closeServiceModal) {
        closeServiceModal.addEventListener('click', () => {
            serviceModal.classList.remove('show');
            setTimeout(() => {
                serviceModal.style.display = 'none';
            }, 300);
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target == serviceModal) {
            serviceModal.classList.remove('show');
            setTimeout(() => {
                serviceModal.style.display = 'none';
            }, 300);
        }
    });

    /* --- Portfolio Section --- */
    // Web Applications Data
    const webApplications = {
        'mydoc': {
            name: 'myDOC',
            url: 'https://script.google.com/macros/s/AKfycbyMX1q7M14WhXsskbElNNJqVwIlyMJ1aZOfZx5WL8GwqdUz5sblYrEzOiOeUhk0yBYuCA/exec',
            email: 'techbrainai.test@gmail.com',
            password: 'apptest12345',
            instructions: 'Welcome to myDOC - a comprehensive digital clinic management system. Use the test credentials below to explore the application. After logging in, you\'ll have access to patient management, appointment scheduling, billing, and more.'
        }
    };

    // Tab Switching
    const portfolioTabs = document.querySelectorAll('.portfolio-tab');
    const portfolioContents = document.querySelectorAll('.portfolio-content');

    portfolioTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            portfolioTabs.forEach(t => t.classList.remove('active'));
            portfolioContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${targetTab}-content`).classList.add('active');
        });
    });

    // Login Modal Functionality
    const loginModal = document.getElementById('login-modal');
    const closeLoginModal = document.querySelector('.close-login-modal');

    window.openLoginModal = function (appKey) {
        const app = webApplications[appKey];
        if (!app) return;

        // Populate modal content
        document.getElementById('login-app-name').innerText = `${app.name} Login`;
        document.getElementById('login-instructions-text').innerText = app.instructions;
        document.getElementById('login-email').innerText = app.email;
        document.getElementById('login-password').innerText = app.password;
        document.getElementById('open-app-btn').href = app.url;

        // Show modal
        loginModal.style.display = 'flex';
        setTimeout(() => {
            loginModal.classList.add('show');
        }, 10);
    };

    // Close login modal
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.classList.remove('show');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 300);
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target == loginModal) {
            loginModal.classList.remove('show');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 300);
        }
    });

    // Copy to Clipboard Function
    window.copyToClipboard = function (elementId) {
        const element = document.getElementById(elementId);
        const text = element.innerText;

        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);

        // Select and copy
        textarea.select();
        document.execCommand('copy');

        // Remove textarea
        document.body.removeChild(textarea);

        // Visual feedback
        const copyBtn = event.target.closest('.copy-btn');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        copyBtn.style.background = 'var(--color-accent)';
        copyBtn.style.color = 'var(--color-primary)';

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = 'transparent';
            copyBtn.style.color = 'var(--color-secondary)';
        }, 2000);
    };

});
