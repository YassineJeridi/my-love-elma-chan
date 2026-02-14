// ============================================
// Valentine's Day Website - Complete Script
// ============================================

// Configuration
const CONFIG = {
    floatingElementCount: 15,
    noBtnEvasionDistance: 120,
    slideshowSpeed: 50, // pixels per second
    swipeThreshold: 50
};

// State
let state = {
    currentIndex: 0,
    images: [],
    isDragging: false,
    startX: 0,
    currentX: 0,
    slideshowAnimation: null
};

// DOM Elements
const elements = {};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    loadImages();
    setupEventListeners();
    createFloatingElements();
});

function initializeElements() {
    elements.noBtn = document.getElementById('noBtn');
    elements.yesBtn = document.getElementById('yesBtn');
    elements.buttonsContainer = document.getElementById('buttonsContainer');
    elements.questionScreen = document.getElementById('questionScreen');
    elements.menuScreen = document.getElementById('menuScreen');
    elements.galleryScreen = document.getElementById('galleryScreen');
    elements.slideshowScreen = document.getElementById('slideshowScreen');
    elements.cardsBtn = document.getElementById('cardsBtn');
    elements.slideshowBtn = document.getElementById('slideshowBtn');
    elements.backFromGallery = document.getElementById('backFromGallery');
    elements.backFromSlideshow = document.getElementById('backFromSlideshow');
    elements.cardContainer = document.getElementById('cardContainer');
    elements.mainCard = document.getElementById('mainCard');
    elements.cardImage = document.getElementById('cardImage');
    elements.prevBtn = document.getElementById('prevBtn');
    elements.nextBtn = document.getElementById('nextBtn');
    elements.progressDots = document.getElementById('progressDots');
    elements.slideshowTrack = document.getElementById('slideshowTrack');
    elements.slideshowCounter = document.getElementById('slideshowCounter');
    elements.floatingContainer = document.getElementById('floatingContainer');
}

// ============================================
// Load Images from folder
// ============================================

async function loadImages() {
    try {
        const response = await fetch('images.json');
        const data = await response.json();
        
        // Extract all image filenames
        data.imageGroups.forEach(group => {
            group.images.forEach(image => {
                state.images.push(`images/${image}`);
            });
        });
        
        console.log(`Loaded ${state.images.length} images`);
    } catch (error) {
        console.error('Error loading images:', error);
        // Fallback - try to load images directly
        state.images = [
            'images/IMG_5127.jpg',
            'images/IMG_5128.jpg',
            'images/IMG_5129.jpg'
        ];
    }
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // No button evasion
    document.addEventListener('mousemove', handleMouseMove);
    elements.noBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        moveNoButtonAway(e.clientX, e.clientY);
    });
    elements.noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
    // Touch support for No button
    elements.noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        moveNoButtonAway(touch.clientX, touch.clientY);
    }, { passive: false });

    // Yes button
    elements.yesBtn.addEventListener('click', handleYesClick);

    // Menu buttons
    elements.cardsBtn.addEventListener('click', () => showMode('cards'));
    elements.slideshowBtn.addEventListener('click', () => showMode('slideshow'));

    // Back buttons
    elements.backFromGallery.addEventListener('click', backToMenu);
    elements.backFromSlideshow.addEventListener('click', backToMenu);

    // Gallery navigation
    elements.prevBtn.addEventListener('click', () => navigateCard(-1));
    elements.nextBtn.addEventListener('click', () => navigateCard(1));

    // Swipe/drag for cards
    elements.cardContainer.addEventListener('mousedown', handleDragStart);
    elements.cardContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
}

// ============================================
// Floating Background Elements
// ============================================

function createFloatingElements() {
    const symbols = ['💕', '💉', '💊', '🩺', '❤️', '💗', '🩹', '❤️‍🩹', '💖', '🏥'];
    
    for (let i = 0; i < CONFIG.floatingElementCount; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element';
        element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        element.style.left = `${Math.random() * 100}%`;
        element.style.animationDelay = `${Math.random() * 10}s`;
        element.style.animationDuration = `${8 + Math.random() * 6}s`;
        elements.floatingContainer.appendChild(element);
    }
}

// ============================================
// No Button Evasion
// ============================================

let lastMoveTime = 0;

function handleMouseMove(e) {
    if (!elements.noBtn || elements.questionScreen.classList.contains('hidden')) return;

    const now = Date.now();
    if (now - lastMoveTime < 100) return;

    const btn = elements.noBtn;
    const btnRect = btn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const distance = Math.sqrt(
        Math.pow(e.clientX - btnCenterX, 2) + 
        Math.pow(e.clientY - btnCenterY, 2)
    );

    if (distance < CONFIG.noBtnEvasionDistance) {
        moveNoButtonAway(e.clientX, e.clientY);
        lastMoveTime = now;
    }
}

function moveNoButtonAway(cursorX, cursorY) {
    const btn = elements.noBtn;
    const container = elements.buttonsContainer;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // Calculate button center
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    // Calculate angle away from cursor
    const angleFromCursor = Math.atan2(btnCenterY - cursorY, btnCenterX - cursorX);
    
    // Add some randomness
    const randomAngle = angleFromCursor + (Math.random() - 0.5) * Math.PI / 2;
    
    // Calculate new position
    const moveDistance = 180;
    let newX = btnCenterX + Math.cos(randomAngle) * moveDistance - containerRect.left - btnRect.width / 2;
    let newY = btnCenterY + Math.sin(randomAngle) * moveDistance - containerRect.top - btnRect.height / 2;

    // Keep button in bounds of the question container
    const questionContainer = document.querySelector('.question-container');
    const qRect = questionContainer.getBoundingClientRect();
    
    const padding = 10;
    const maxX = qRect.width - btnRect.width - padding;
    const maxY = qRect.height - containerRect.top + qRect.top - btnRect.height - padding;
    const minX = -containerRect.left + qRect.left + padding;
    const minY = -containerRect.top + qRect.top + padding;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    btn.style.position = 'absolute';
    btn.style.left = `${newX}px`;
    btn.style.top = `${newY}px`;
}

// ============================================
// Yes Button Action
// ============================================

function handleYesClick() {
    createConfetti();
    
    setTimeout(() => {
        elements.questionScreen.classList.add('hidden');
        elements.menuScreen.classList.remove('hidden');
        elements.menuScreen.classList.add('fade-in');
    }, 500);
}

function createConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'];
    const shapes = ['❤️', '💕', '💊', '💉', '🩺', '✨'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = '-20px';
        confetti.style.fontSize = `${12 + Math.random() * 20}px`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// ============================================
// Mode Selection
// ============================================

function showMode(mode) {
    elements.menuScreen.classList.add('hidden');

    if (mode === 'cards') {
        elements.galleryScreen.classList.remove('hidden');
        elements.galleryScreen.classList.add('fade-in');
        initializeGallery();
    } else if (mode === 'slideshow') {
        elements.slideshowScreen.classList.remove('hidden');
        elements.slideshowScreen.classList.add('fade-in');
        initializeSlideshow();
    }
}

function backToMenu() {
    // Stop slideshow animation
    if (state.slideshowAnimation) {
        cancelAnimationFrame(state.slideshowAnimation);
        state.slideshowAnimation = null;
    }

    state.currentIndex = 0;
    
    elements.galleryScreen.classList.add('hidden');
    elements.slideshowScreen.classList.add('hidden');
    elements.menuScreen.classList.remove('hidden');
    elements.menuScreen.classList.add('fade-in');
}

// ============================================
// Card Gallery
// ============================================

function initializeGallery() {
    if (state.images.length === 0) {
        console.error('No images loaded');
        return;
    }

    state.currentIndex = 0;
    createProgressDots();
    loadCurrentCard();
    updateNavigationButtons();
}

function createProgressDots() {
    elements.progressDots.innerHTML = '';
    
    // Show max 20 dots for usability
    const maxDots = Math.min(state.images.length, 20);
    const step = Math.ceil(state.images.length / maxDots);
    
    for (let i = 0; i < state.images.length; i += step) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset.index = i;
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => jumpToImage(parseInt(dot.dataset.index)));
        elements.progressDots.appendChild(dot);
    }
}

function loadCurrentCard() {
    const imagePath = state.images[state.currentIndex];
    elements.cardImage.src = imagePath;
    
    // Update active dot
    const dots = elements.progressDots.querySelectorAll('.dot');
    dots.forEach(dot => {
        const dotIndex = parseInt(dot.dataset.index);
        dot.classList.toggle('active', Math.abs(dotIndex - state.currentIndex) < Math.ceil(state.images.length / dots.length));
    });
}

function navigateCard(direction) {
    const newIndex = state.currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < state.images.length) {
        // Animate card exit
        const card = elements.mainCard;
        card.style.transform = `translateX(${-direction * 100}%)`;
        card.style.opacity = '0';
        
        setTimeout(() => {
            state.currentIndex = newIndex;
            card.style.transition = 'none';
            card.style.transform = `translateX(${direction * 100}%)`;
            loadCurrentCard();
            
            requestAnimationFrame(() => {
                card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                card.style.transform = 'translateX(0)';
                card.style.opacity = '1';
            });
        }, 200);
        
        updateNavigationButtons();
    }
}

function jumpToImage(index) {
    if (index >= 0 && index < state.images.length) {
        state.currentIndex = index;
        loadCurrentCard();
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    elements.prevBtn.disabled = state.currentIndex === 0;
    elements.nextBtn.disabled = state.currentIndex === state.images.length - 1;
}

// ============================================
// Drag/Swipe for Cards
// ============================================

function handleDragStart(e) {
    if (!elements.galleryScreen.classList.contains('hidden')) {
        state.isDragging = true;
        state.startX = e.clientX;
        state.currentX = e.clientX;
        elements.cardContainer.style.cursor = 'grabbing';
    }
}

function handleTouchStart(e) {
    if (!elements.galleryScreen.classList.contains('hidden')) {
        state.isDragging = true;
        state.startX = e.touches[0].clientX;
        state.currentX = e.touches[0].clientX;
    }
}

function handleDragMove(e) {
    if (!state.isDragging) return;
    state.currentX = e.clientX;
    
    const diff = state.currentX - state.startX;
    elements.mainCard.style.transform = `translateX(${diff * 0.5}px) rotate(${diff * 0.02}deg)`;
}

function handleTouchMove(e) {
    if (!state.isDragging) return;
    state.currentX = e.touches[0].clientX;
    
    const diff = state.currentX - state.startX;
    elements.mainCard.style.transform = `translateX(${diff * 0.5}px) rotate(${diff * 0.02}deg)`;
}

function handleDragEnd() {
    if (!state.isDragging) return;
    state.isDragging = false;
    elements.cardContainer.style.cursor = 'grab';
    
    const diff = state.currentX - state.startX;
    
    // Reset card position
    elements.mainCard.style.transform = '';
    
    // Navigate based on swipe direction
    if (Math.abs(diff) > CONFIG.swipeThreshold) {
        if (diff > 0 && state.currentIndex > 0) {
            navigateCard(-1);
        } else if (diff < 0 && state.currentIndex < state.images.length - 1) {
            navigateCard(1);
        }
    }
}

// ============================================
// Slideshow
// ============================================

function initializeSlideshow() {
    if (state.images.length === 0) {
        console.error('No images loaded');
        return;
    }

    // Create slideshow track with images
    elements.slideshowTrack.innerHTML = '';
    
    // Duplicate images for seamless loop
    const allImages = [...state.images, ...state.images];
    
    allImages.forEach(imagePath => {
        const img = document.createElement('img');
        img.src = imagePath;
        img.className = 'slideshow-image';
        img.alt = 'Memory';
        elements.slideshowTrack.appendChild(img);
    });

    // Update counter
    elements.slideshowCounter.textContent = `${state.images.length} beautiful memories 💕`;

    // Start animation
    startSlideshowAnimation();
}

function startSlideshowAnimation() {
    let position = 0;
    const trackWidth = elements.slideshowTrack.scrollWidth / 2;
    
    function animate() {
        position -= CONFIG.slideshowSpeed / 60; // 60fps
        
        // Reset position for seamless loop
        if (Math.abs(position) >= trackWidth) {
            position = 0;
        }
        
        elements.slideshowTrack.style.transform = `translateX(${position}px)`;
        state.slideshowAnimation = requestAnimationFrame(animate);
    }
    
    animate();
}

// ============================================
// Keyboard Navigation
// ============================================

function handleKeyPress(e) {
    // Gallery navigation
    if (!elements.galleryScreen.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') {
            navigateCard(-1);
        } else if (e.key === 'ArrowRight') {
            navigateCard(1);
        }
    }
    
    // Escape to go back
    if (e.key === 'Escape') {
        if (!elements.galleryScreen.classList.contains('hidden') || 
            !elements.slideshowScreen.classList.contains('hidden')) {
            backToMenu();
        }
    }
}
