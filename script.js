// ============================================
// sweethomes-bnb - JavaScript Functionality
// ============================================

// CONFIGURATION
// REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzorDVhYk_bJiUpMdDw5OqxqWHa-OGb_MXT3mImE8B0ymEt1CZmYi3pRy4yYfF0YN96/exec';

// ============================================
// DYNAMIC DATA LOADING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize features first (static content)
    initSmoothScroll();
    initSocialIcons();
    initScrollAnimations();
    initLogoAnimation();
    initPromoBanner();

    // 2. Fetch Dynamic Data (Prices & Images)
    if (BACKEND_URL && !BACKEND_URL.includes('REPLACE')) {
        fetchDynamicData();
    } else {
        console.warn('Backend URL not configured. Using static defaults.');
        // Initialize carousel/form with static defaults if backend missing
        initializeComponents();
    }
});

async function fetchDynamicData() {
    try {
        const response = await fetch(`${BACKEND_URL}?action=getData`);
        const data = await response.json();

        if (data.status === 'success') {
            // Update Prices
            if (data.prices) updatePrices(data.prices);

            // Update Images
            if (data.images && data.images.length > 0) {
                updateCarousel(data.images);
            }

            // Always initialize components (booking form needs to run regardless of images)
            initializeComponents();
        }
    } catch (err) {
        console.error('Failed to load dynamic data:', err);
        initializeComponents(); // Fallback on error
    }
}

function updatePrices(prices) {
    const roomSelect = document.getElementById('roomType');
    if (!roomSelect) return;

    // Map backend keys to select options
    for (const [rawKey, price] of Object.entries(prices)) {
        let key = rawKey;

        // Fallback Mapping for Legacy Sheet Names
        if (rawKey === 'Standard' || rawKey === 'Standard Room') key = '1 Bedroom';
        if (rawKey === 'Deluxe' || rawKey === 'Deluxe Room') key = '2 Bedroom';
        if (rawKey === 'Suite' || rawKey === 'Executive Suite') key = '3 Bedroom';

        // Direct match logic for "1 Bedroom", "2 Bedroom", "3 Bedroom"
        // The backend key (e.g., "1 Bedroom") should match the option value in HTML

        const option = roomSelect.querySelector(`option[value="${key}"]`);
        if (option) {
            option.setAttribute('data-price', price);
            // Update visible text: "1 Bedroom (Max 2 Guests) - KES 3,500/night"
            // We split by " - " to preserve the name/guest part
            const currentText = option.innerText.split(' - ')[0];
            option.innerText = `${currentText} - KES ${Number(price).toLocaleString()}/night`;
        }

        // Update Room Cards (Key is "1 Bedroom" -> ID "priceDisplay1Bedroom")
        const cardId = 'priceDisplay' + key.replace(' ', '');
        const cardPriceSpan = document.getElementById(cardId);
        if (cardPriceSpan) {
            cardPriceSpan.innerText = `KES ${Number(price).toLocaleString()}`;
        }
    }
}

function updateCarousel(images) {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');

    if (!track || !dotsContainer) return;

    // Clear existing (static) slides
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Add new slides
    images.forEach((img, index) => {
        // Slide
        const slide = document.createElement('li');
        slide.className = 'carousel-slide';
        if (index === 0) slide.classList.add('active'); // First one active

        const image = document.createElement('img');
        image.src = img.url;
        image.alt = img.caption || `Property Image ${index + 1}`;

        slide.appendChild(image);
        track.appendChild(slide);
    });

    // Note: Carousel class is initialized in initializeComponents() which is called after this return
}

function initializeComponents() {
    // Initialize carousel with whatever is in the DOM
    const carouselElement = document.getElementById('propertyCarousel');
    if (carouselElement) new Carousel(carouselElement);

    // Initialize booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) new BookingForm(bookingForm);
}

// ============================================
// CAROUSEL FUNCTIONALITY (Existing Class)
// ============================================
class Carousel {
    constructor(carouselElement) {
        this.carousel = carouselElement;
        this.track = this.carousel.querySelector('#carouselTrack');
        // Re-query slides in case they were dynamically added
        this.slides = Array.from(this.track.children);
        this.nextButton = this.carousel.querySelector('#carouselNext');
        this.prevButton = this.carousel.querySelector('#carouselPrev');
        this.dotsContainer = document.querySelector('#carouselDots');

        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isTransitioning = false;

        // Cleanup old listeners if re-initializing? 
        // Simplest way for MVP is just to attach new ones. 
        // ideally we'd remove old ones but for this scope it's fine.

        this.init();
    }

    init() {
        // Set initial active slide
        if (this.slides.length > 0) {
            this.slides.forEach(s => s.classList.remove('active')); // Reset
            this.slides[0].classList.add('active');
        }

        // Create dots
        this.createDots();

        // Event listeners (Clear old ones by cloning? No, just add. Watch for duplicates in full app)
        // For safety, let's assume this runs once per element lifecycle.

        // Remove existing listeners hack: clone node (strips listeners)
        // this.nextButton.replaceWith(this.nextButton.cloneNode(true));
        // this.nextButton = this.carousel.querySelector('#carouselNext');

        // Actually, let's just stick to adding them. 
        this.nextButton.onclick = () => this.moveToNext();
        this.prevButton.onclick = () => this.moveToPrev();

        // Dots
        // this.createDots handles dot listeners

        // Touch/swipe support
        this.track.ontouchstart = (e) => this.handleTouchStart(e);
        this.track.ontouchend = (e) => this.handleTouchEnd(e);

        // Hover
        this.carousel.onmouseenter = () => this.stopAutoplay();
        this.carousel.onmouseleave = () => this.startAutoplay();

        // Start autoplay
        this.startAutoplay();
    }

    createDots() {
        this.dotsContainer.innerHTML = ''; // Clear existing
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
        if (this.autoplayInterval) clearInterval(this.autoplayInterval);
        this.autoplayInterval = setInterval(() => {
            this.moveToNext();
        }, 5000);
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
        document.getElementById('arrivalDate')?.setAttribute('min', today);
        document.getElementById('departureDate')?.setAttribute('min', today);

        // Update departure min date when arrival date changes
        document.getElementById('arrivalDate')?.addEventListener('change', (e) => {
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
        document.getElementById('roomType')?.addEventListener('change', () => this.calculateTotal());
        document.getElementById('arrivalDate')?.addEventListener('change', () => this.calculateTotal());
        document.getElementById('departureDate')?.addEventListener('change', () => this.calculateTotal());
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        // Collect form data
        const countryCode = document.getElementById('countryCode').value;
        const rawMobile = document.getElementById('mobile').value;
        const fullPhoneNumber = countryCode === 'other' ? rawMobile : `${countryCode} ${rawMobile}`;

        const formData = {
            action: 'book', // Important: Tell backend this is a booking
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
            totalPrice: this.calculateTotal(true) // Helper to get raw number
        };

        const submitBtn = document.getElementById('submitBooking');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Processing...';
        submitBtn.disabled = true;

        try {
            if (BACKEND_URL && !BACKEND_URL.includes('REPLACE')) {
                // Send to Google Sheets
                // Use no-cors mode if issues, but CORS should be handled by GAS "Everyone" permissions
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if (result.status === 'success') {
                    this.showSuccess();
                } else {
                    alert('Error: ' + result.message);
                }
            } else {
                console.warn('Backend not connected. Simulating success.');
                alert('Backend URL not configured. Submitting locally only.');
                this.showSuccess();
            }
        } catch (err) {
            console.error('Submission Error:', err);
            alert('There was an error submitting your booking. Please try again or contact us directly.');
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    }

    showSuccess() {
        this.form.reset();
        document.getElementById('totalPriceDisplay').innerText = 'KES 0';
        const priceRow = document.querySelector('.total-price-row');
        if (priceRow) priceRow.style.display = 'none';

        // Show success message
        const successDiv = document.getElementById('bookingSuccess');
        if (successDiv) {
            successDiv.classList.remove('hidden');
            successDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Booking Confirmed!');
        }
    }

    calculateTotal(returnNumber = false) {
        const roomSelect = document.getElementById('roomType');
        const arrivalInput = document.getElementById('arrivalDate');
        const departureInput = document.getElementById('departureDate');
        const totalDisplay = document.getElementById('totalPriceDisplay');
        const priceRow = document.querySelector('.total-price-row');

        // Reset display
        if (!returnNumber) totalDisplay.innerText = 'KES 0';

        const selectedOption = roomSelect.options[roomSelect.selectedIndex];
        const pricePerNight = parseInt(selectedOption ? selectedOption.getAttribute('data-price') : 0);
        const arrivalDate = new Date(arrivalInput.value);
        const departureDate = new Date(departureInput.value);

        if (pricePerNight > 0 && !isNaN(arrivalDate) && !isNaN(departureDate) && departureDate > arrivalDate) {
            const diffTime = Math.abs(departureDate - arrivalDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const totalPrice = pricePerNight * diffDays;

            if (returnNumber) return totalPrice;

            totalDisplay.innerText = `KES ${totalPrice.toLocaleString()} (${diffDays} nights)`;
            if (priceRow) priceRow.style.display = 'block';
        }

        return returnNumber ? 0 : null;
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

// Reset form function for the success message button
window.resetBookingForm = function () {
    document.getElementById('bookingSuccess').classList.add('hidden');
    document.getElementById('bookingForm').reset();
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
    // Kept running as per user request
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

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
        }, 500);
    }, 5000);
}

// Add social media icons
function initSocialIcons() {
    // Icons are now hardcoded in HTML for stability, 
    // but we can keep this for future dynamic enhancements if needed.
    // Currently, it does nothing as we changed strategy.
}
