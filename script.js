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
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    validateForm() {
        const arrivalDate = document.getElementById('arrivalDate').value;
        const departureDate = document.getElementById('departureDate').value;
        if (departureDate <= arrivalDate) {
            alert('Departure date must be after arrival date.');
            return false;
        }
        return true;
    }
    async handleSubmit(e) {
        e.preventDefault();
        if (!this.validateForm()) {
            return;
        }
        const submitButton = document.getElementById('submitBooking');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        // Collect form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            nationality: document.getElementById('nationality').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            idPassport: document.getElementById('idPassport').value,
            carPlate: document.getElementById('carPlate').value,
            roomType: document.getElementById('roomType').value,
            arrivalDate: document.getElementById('arrivalDate').value,
            arrivalTime: document.getElementById('arrivalTime').value,
            departureDate: document.getElementById('departureDate').value,
            departureTime: document.getElementById('departureTime').value,
        };
        // Calculate estimated price
        const totalPrice = this.calculateTotalPrice(formData.arrivalDate, formData.departureDate, formData.roomType);
        formData.totalPriceEstimate = totalPrice;
        try {
            // TODO: Replace with your actual Google Apps Script Web App URL
            // Google Apps Script Web App URL
            const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw-4HSOePgfTWnocH5i1hCuBv4j9GgfjNumqz_YcrMIipYAZ1mSh1Noo1iMArW8EMlfJQ/exec';
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                // mode: 'no-cors', // IMPORTANT: 'no-cors' is often needed for Google Apps Script simple triggers, but it prevents reading the response.
                // ideally use 'cors' if the script handles OPTIONS, but standard GAS setup usually works best with redirect following.
                // For a robust setup, standard 'POST' works if the script header is set correctly.
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', // Send as text/plain to avoid preflight CORS checks
                },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.status === 'success') {
                this.showSuccess();
            } else {
                throw new Error(result.message || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('Error: ' + error.message);
            submitButton.disabled = false;
            submitButton.textContent = 'Confirm Booking';
        }
    }
    calculateTotalPrice(arrivalDate, departureDate, roomType) {
        const start = new Date(arrivalDate);
        const end = new Date(departureDate);
        // Calculate difference in time
        const timeDiff = end.getTime() - start.getTime();
        // Calculate difference in days (round up to ensure at least 1 night)
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        // Minimum 1 night
        const billingNights = nights > 0 ? nights : 1;
        const rates = {
            '1-bedroom': 3000,
            '2-bedroom': 5000,
            '3-bedroom': 8000
        };
        const rate = rates[roomType] || 0;
        const total = rate * billingNights;
        return `KES ${total.toLocaleString()}`;
    }
    showSuccess() {
        this.form.classList.add('hidden');
        document.getElementById('bookingSuccess').classList.remove('hidden');
        // Scroll to success message
        document.getElementById('bookingSuccess').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
// ============================================
// UTILITY FUNCTIONS
// ============================================
// Reset booking form
function resetBookingForm() {
    const form = document.getElementById('bookingForm');
    const successMessage = document.getElementById('bookingSuccess');
    form.reset();
    form.classList.remove('hidden');
    successMessage.classList.add('hidden');
    const submitButton = document.getElementById('submitBooking');
    submitButton.disabled = false;
    submitButton.textContent = 'Confirm Booking';
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Skip if it's just "#"
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offset = 80; // Offset for sticky header if any
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
// Add social media icons
function initSocialIcons() {
    const socialContainer = document.getElementById('socialIcons');
    // Social media links (update with actual URLs)
    // Social media links
    const socialLinks = [
        { iconClass: 'fa-brands fa-facebook', url: 'https://facebook.com/sweethomes-bnb', label: 'Facebook' },
        { iconClass: 'fa-brands fa-tiktok', url: 'https://tiktok.com/@sweethomes-bnb', label: 'TikTok' },
        { iconClass: 'fa-brands fa-instagram', url: 'https://instagram.com/sweethomes-bnb', label: 'Instagram' },
        { iconClass: 'fa-brands fa-youtube', url: 'https://youtube.com/@sweethomes-bnb', label: 'YouTube' },
    ];
    socialLinks.forEach(social => {
        const link = document.createElement('a');
        link.href = social.url;
        link.className = 'social-icon';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', social.label);
        // Create icon element
        const icon = document.createElement('i');
        icon.className = social.iconClass;
        link.appendChild(icon);
        socialContainer.appendChild(link);
    });
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
        // Animation lasts 3 seconds and repeats 3 times = 9 seconds total
        setTimeout(() => {
            logo.classList.remove('animate-swing');
        }, 9000);
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
