document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressIndicator = document.getElementById('progressIndicator');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const dotNav = document.querySelector('.dot-nav');
    const cornerLogoCommschool = document.getElementById('corner-logo-commschool');
    const cornerLogoTouch = document.getElementById('corner-logo-touch');
    const totalSlides = slides.length;

    // --- State ---
    let currentSlideIndex = 0;
    const animationDelayStep = 0.1; // seconds for staggered list item animation

    // --- Initialization Check ---
    if (totalSlides === 0) {
        console.warn("No slides found.");
        // Disable controls if no slides
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        if (progressIndicator) progressIndicator.textContent = '0 / 0';
        return; // Exit script
    }

    // --- Helper to Show/Hide Corner Logos ---
    /**
     * Shows or hides the small corner logos based on whether the current slide is a title slide.
     */
    function updateCornerLogosVisibility() {
        const isTitleSlide = slides[currentSlideIndex]?.classList.contains('title-slide');

        if (cornerLogoCommschool) {
            cornerLogoCommschool.classList.toggle('hidden', isTitleSlide);
        }
        if (cornerLogoTouch) {
            cornerLogoTouch.classList.toggle('hidden', isTitleSlide);
        }
    }

    // --- Navigation Setup Functions ---

    /**
     * Generates the dot navigation elements based on the number of slides.
     */
    function setupDotNav() {
        if (!dotNav) return;
        dotNav.innerHTML = ''; // Clear previous dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.addEventListener('click', () => goToSlide(index));
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dotNav.appendChild(dot);
        });
        updateDotNav(); // Set initial active dot
    }

    /**
     * Updates the active state of the dot navigation.
     */
    function updateDotNav() {
        if (!dotNav) return;
        const dots = dotNav.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentSlideIndex);
            dot.setAttribute('aria-current', idx === currentSlideIndex ? 'true' : 'false');
        });
    }

    /**
     * Updates the width of the progress bar fill.
     */
    function updateProgressBar() {
        if (!progressBarFill) return;
        const percent = totalSlides > 0 ? ((currentSlideIndex + 1) / totalSlides) * 100 : 0;
        progressBarFill.style.width = percent + '%';
    }

    /**
     * Enables/disables the Previous/Next buttons based on the current slide index.
     */
    function updateNavigationButtons() {
        if (prevBtn) prevBtn.disabled = currentSlideIndex === 0;
        if (nextBtn) nextBtn.disabled = currentSlideIndex === totalSlides - 1;
    }

    /**
     * Updates the text content of the progress indicator (e.g., "1 / 16").
     */
    function updateProgressIndicator() {
         if (progressIndicator) {
            progressIndicator.textContent = `${currentSlideIndex + 1} / ${totalSlides}`;
        }
    }

    // --- Slide Animation & Display Functions ---

    /**
     * Applies staggered animation delays to list items within a slide.
     * @param {HTMLElement} slideElement - The slide whose list items should be animated.
     * @param {boolean} isActive - Whether the slide is becoming active (true) or inactive (false).
     */
    function animateListItems(slideElement, isActive) {
        const listItems = slideElement.querySelectorAll('.slide-content ul > li');
        listItems.forEach((item, itemIndex) => {
            // Apply delay only if the slide is becoming active
            item.style.transitionDelay = isActive ? `${itemIndex * animationDelayStep}s` : '0s';
        });
    }

    /**
     * Shows the target slide and handles transitions.
     * @param {number} newIndex - The index of the slide to show.
     */
    function showSlide(newIndex) {
        if (newIndex < 0 || newIndex >= totalSlides || newIndex === currentSlideIndex) return;

        const oldIndex = currentSlideIndex;
        currentSlideIndex = newIndex;

        // First, update corner logo visibility based on the *new* slide
        updateCornerLogosVisibility();

        slides.forEach((slide, index) => {
            const isActive = index === currentSlideIndex;
            const isPrevious = index === oldIndex;

            // Manage CSS classes for transitions
            slide.classList.remove('active', 'previous');

            if (isActive) {
                slide.classList.add('active');
                animateListItems(slide, true);
            } else if (isPrevious) {
                slide.classList.add('previous');
                animateListItems(slide, false);
                 // Clean up the .previous class after the transition completes
                 setTimeout(() => {
                     // Double-check it's still the intended previous slide before removing class
                     if (slide.classList.contains('previous') && index === oldIndex) {
                         slide.classList.remove('previous');
                     }
                 }, 600); // Should match CSS transition duration
            } else {
                 // Ensure list items are reset if the slide is neither active nor the previous one
                 animateListItems(slide, false);
            }
        });

        // Update all navigation elements
        updateNavigationButtons();
        updateProgressIndicator();
        updateProgressBar();
        updateDotNav();
    }

    /**
     * Helper function to navigate directly to a specific slide index.
     * @param {number} index - The target slide index.
     */
     function goToSlide(index) {
        showSlide(index);
    }

    /**
     * Navigates to the next slide.
     */
    function nextSlide() {
        showSlide(currentSlideIndex + 1);
    }

    /**
     * Navigates to the previous slide.
     */
    function prevSlide() {
        showSlide(currentSlideIndex - 1);
    }

    // --- Initialization Function ---

    /**
     * Sets up the initial state of the presentation and attaches event listeners.
     */
    function initializePresentation() {
        // Set initial CSS classes for slides
        slides.forEach((slide, index) => {
             slide.classList.remove('active', 'previous');
             if(index === currentSlideIndex) {
                 slide.classList.add('active');
                 animateListItems(slide, true);
             } // Other slides start hidden via CSS
        });

        // Setup navigation elements
        setupDotNav();
        updateNavigationButtons();
        updateProgressIndicator();
        updateProgressBar();

        // Set initial corner logo visibility
        updateCornerLogosVisibility();

        // Attach Event Listeners
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
            // Allow navigation only if the event doesn't originate from an input field
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            if (event.key === 'ArrowRight' || event.key === ' ') {
                 event.preventDefault(); // Prevent space bar from scrolling page
                nextSlide();
            } else if (event.key === 'ArrowLeft') {
                prevSlide();
            }
        });

        // Touch swipe support
        let touchStartX = 0;
        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true }); // Use passive listener for touchstart

        document.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const delta = touchEndX - touchStartX;
            const threshold = 50; // Minimum swipe distance

            if (delta < -threshold) {
                nextSlide(); // Swipe Left
            } else if (delta > threshold) {
                prevSlide(); // Swipe Right
            }
        });
    }

    // --- Start Presentation ---
    initializePresentation();

}); 