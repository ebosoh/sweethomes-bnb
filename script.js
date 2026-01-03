// ============================================
// sweethomes-bnb - JavaScript Functionality
// ============================================

// ============================================
// CAROUSEL FUNCTIONALITY
// ============================================
class Carousel {
    constructor(carouselElement) {
        this.carousel = carouselElement;
        this.track = this.carousel.querySelector('#carouselTrack');
        this.slides = Array.from(this.track.children);
        this.nextButton = this.carousel.querySelector('#carouselNext');
        this.prevButton = this.carousel.querySelector('#carouselPrev');
        this.dotsContainer = document.querySelector('#carouselDots');

        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        // Set initial active slide
        if (this.slides.length > 0) {
            this.slides[0].classList.add('active');
        }

        // Create dots
        this.createDots();

        // Event listeners
        this.nextButton.addEventListener('click', () => this.moveToNext());
        this.prevButton.addEventListener('click', () => this.moveToPrev());

        // Touch/swipe support
        this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Mouse drag support (desktop)
        let isDragging = false;
        let startX = 0;

        this.track.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            this.track.style.cursor = 'grabbing';
        });

        this.track.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        this.track.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            this.track.style.cursor = 'grab';

            const endX = e.clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.moveToNext();
                } else {
                    this.moveToPrev();
                }
            }
        });

        this.track.addEventListener('mouseleave', () => {
            isDragging = false;
            this.track.style.cursor = 'grab';
        });

        // Start autoplay
        this.startAutoplay();

        // Pause autoplay on hover
        this.carousel.addEventListener('mouseenter', () => this.stopAutoplay());
        this.carousel.addEventListener('mouseleave', () => this.startAutoplay());
    }

    createDots() {
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            if (index === 0) dot.classList.add('active');

            dot.addEventListener('click', () => this.moveToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }

    updateDots() {
        const dots = Array.from(this.dotsContainer.children);
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    moveToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;

        this.isTransitioning = true;
        const previousIndex = this.currentIndex;
        this.currentIndex = index;

        // Remove active class from previous slide
        this.slides[previousIndex].classList.remove('active');
        this.slides[previousIndex].classList.add('prev');

        // Add active class to new slide
        this.slides[this.currentIndex].classList.add('active');
        this.slides[this.currentIndex].classList.remove('prev');

        // Update dots
        this.updateDots();

        // Reset transition lock after animation completes
        setTimeout(() => {
            this.slides[previousIndex].classList.remove('prev');
            this.isTransitioning = false;
        }, 1000); // Match CSS transition duration

        // Restart autoplay timer
        this.restartAutoplay();
    }

    moveToNext() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        this.moveToSlide(nextIndex);
    }

    moveToPrev() {
        const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.moveToSlide(prevIndex);
    }

    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.moveToNext();
            } else {
                this.moveToPrev();
            }
        }
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.moveToNext();
        }, 5000); // Change slide every 5 seconds
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    restartAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
}

// ============================================
// FORM VALIDATION & SUBMISSION
// ============================================
class BookingForm {
    constructor(formElement) {
        this.form = formElement;
        this.init();
    }

    init() {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('arrivalDate').setAttribute('min', today);
        document.getElementById('departureDate').setAttribute('min', today);

        // Update departure min date when arrival date changes
        document.getElementById('arrivalDate').addEventListener('change', (e) => {
            const arrivalDate = e.target.value;
            document.getElementById('departureDate').setAttribute('min', arrivalDate);

            // Clear departure date if it's before arrival date
            const departureDate = document.getElementById('departureDate').value;
            if (departureDate && departureDate < arrivalDate) {
                document.getElementById('departureDate').value = '';
            }
        });

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time price calculation events
        document.getElementById('roomType').addEventListener('change', () => this.calculateTotal());
        document.getElementById('arrivalDate').addEventListener('change', () => this.calculateTotal());
        document.getElementById('departureDate').addEventListener('change', () => this.calculateTotal());
    }

    handleSubmit(e) {
        e.preventDefault(); // Prevent default form submission

        if (!this.validateForm()) {
            return; // Stop if validation fails
        }

        // Collect form data
        // For international phone, combining code and number
        const countryCode = document.getElementById('countryCode').value;
        const rawMobile = document.getElementById('mobile').value;
        const fullPhoneNumber = countryCode === 'other' ? rawMobile : `${countryCode} ${rawMobile}`;

        const formData = {
            fullName: document.getElementById('fullName').value,
            nationality: document.getElementById('nationality').value,
            phoneNumber: fullPhoneNumber,
            address: document.getElementById('address').value,
            idPassport: document.getElementById('idPassport').value,
            carPlate: document.getElementById('carPlate').value,
            roomType: document.getElementById('roomType').value,
            arrivalDate: document.getElementById('arrivalDate').value,
            arrivalTime: document.getElementById('arrivalTime').value,
            departureDate: document.getElementById('departureDate').value,
            departureTime: document.getElementById('departureTime').value,
        };

        console.log('Form Data Submitted:', formData);

        // Here you would typically send the formData to a server
        // For demonstration, we'll just show an alert
        alert('Booking submitted successfully!\n' + JSON.stringify(formData, null, 2));

        // Optionally, reset the form
        this.form.reset();
        document.getElementById('totalPriceDisplay').innerText = 'KES 0';
        const priceRow = document.querySelector('.total-price-row');
        if (priceRow) priceRow.style.display = 'none';
    }

    calculateTotal() {
        const roomSelect = document.getElementById('roomType');
        const arrivalInput = document.getElementById('arrivalDate');
        const departureInput = document.getElementById('departureDate');
        const totalDisplay = document.getElementById('totalPriceDisplay');
        const priceRow = document.querySelector('.total-price-row');

        // Reset
        totalDisplay.innerText = 'KES 0';
        console.log('Calculating Total...');

        const selectedOption = roomSelect.options[roomSelect.selectedIndex];
        const pricePerNight = parseInt(selectedOption ? selectedOption.getAttribute('data-price') : 0);
        const arrivalDate = new Date(arrivalInput.value);
        const departureDate = new Date(departureInput.value);

        if (pricePerNight > 0 && !isNaN(arrivalDate) && !isNaN(departureDate) && departureDate > arrivalDate) {
            const diffTime = Math.abs(departureDate - arrivalDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const totalPrice = pricePerNight * diffDays;

            totalDisplay.innerText = `KES ${totalPrice.toLocaleString()} (${diffDays} nights)`;
            if (priceRow) priceRow.style.display = 'block';
        }
    }

    validateForm() {
        const arrivalDate = document.getElementById('arrivalDate').value;
        const departureDate = document.getElementById('departureDate').value;

        if (departureDate <= arrivalDate) {
            alert('Departure date must be after arrival date.');
            return false;
        }

        // Phone validation (International safe check)
        const mobile = document.getElementById('mobile').value;
        const address = document.getElementById('address').value;

        if (!mobile || !address) {
            alert('Please complete all fields (Phone and Address)');
            return false;
        }

        return true;
    }
}

// Animate elements on scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe amenity items
    document.querySelectorAll('.amenity-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
}

// Stop logo animation after a few swings
function initLogoAnimation() {
    const logo = document.getElementById('heroLogo');
    if (logo) {
        // Animation continues indefinitely as per user request
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize carousel
    const carouselElement = document.getElementById('propertyCarousel');
    if (carouselElement) {
        new Carousel(carouselElement);
    }

    // Initialize booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        new BookingForm(bookingForm);
    }

    // Initialize other features
    initSmoothScroll();
    initSocialIcons();
    initScrollAnimations();
    initLogoAnimation();

    console.log('sweethomes-bnb initialized successfully!');
});


/* ============================================
   PROMO BANNER LOGIC
   ============================================ */
function initPromoBanner() {
    const promoText = document.getElementById('promoText');
    if (!promoText) return;

    const promos = [
        'Get 10% Discount for any stays more than 5 nights (weekly rate)',
        'Get 20% Discount for stays more than a month (monthly rate)'
    ];

    let currentIndex = 0;

    setInterval(() => {
        // Fade out
        promoText.style.opacity = '0';

        setTimeout(() => {
            // Change text
            currentIndex = (currentIndex + 1) % promos.length;
            promoText.innerText = promos[currentIndex];

            // Fade in
            promoText.style.opacity = '1';
        }, 500); // Wait for fade out to complete
    }, 5000); // Switch every 5 seconds
}

// Add social media icons
function initSocialIcons() {
    const socialContainer = document.getElementById('socialIcons');
    if (!socialContainer) return;

    // Social media links with SVG icons
    const socialLinks = [
        {
            label: 'Facebook',
            url: 'https://www.facebook.com/share/1C28bQvHAD/?mibextid=wwXIfr',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
        },
        {
            label: 'Instagram',
            url: 'https://www.instagram.com/sweet_homes_nakuru?igsh=MXI3N3Qwd2d6Mnc3MQ==',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`
        },
        {
            label: 'TikTok',
            url: 'https://www.tiktok.com/@bnb_nakuru?_r=1&_t=ZM-92lQI0u5h6K',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 1 0-1 13.6 6.84 6.84 0 0 0 6.45-6.84V6.65a5 5 0 0 0 1.95 2.05l.12.04v-3.8z"></path></svg>`
        },
    ];

    socialContainer.innerHTML = ''; // Clear existing content

    socialLinks.forEach(social => {
        const link = document.createElement('a');
        link.href = social.url;
        link.className = 'social-icon';
        link.innerHTML = social.icon;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', social.label);
        socialContainer.appendChild(link);
    });
}
