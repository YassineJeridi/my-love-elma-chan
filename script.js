// ============================================
// Configuration and State Management
// ============================================

const CONFIG = {
    heartCount: 20,
    particleCount: 50,
    animationDuration: 300,
    swipeThreshold: 50,
    slideshowInterval: 3000,
    finalMessageDelay: 60000, // 1 minute
    finalMessageDuration: 5000,
    noBtnEvasionDistance: 100
};

let state = {
    currentIndex: 0,
    imageGroups: [],
    allImages: [],
    isDragging: false,
    startX: 0,
    currentX: 0,
    rotation: { x: 0, y: 0 },
    slideshowPlaying: true,
    slideshowTimer: null,
    currentMode: null // 'cards' or 'slideshow'
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    noBtn: document.getElementById('noBtn'),
    yesBtn: document.getElementById('yesBtn'),
    questionScreen: document.getElementById('questionScreen'),
    menuScreen: document.getElementById('menuScreen'),
    galleryScreen: document.getElementById('galleryScreen'),
    slideshowScreen: document.getElementById('slideshowScreen'),
    cardsBtn: document.getElementById('cardsBtn'),
    slideshowBtn: document.getElementById('slideshowBtn'),
    backFromGallery: document.getElementById('backFromGallery'),
    backFromSlideshow: document.getElementById('backFromSlideshow'),
    cardContainer: document.getElementById('cardContainer'),
    mainCard: document.getElementById('mainCard'),
    cardImage: document.getElementById('cardImage'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    progressDots: document.getElementById('progressDots'),
    currentDate: document.getElementById('currentDate'),
    slideshowImage: document.getElementById('slideshowImage'),
    slideshowDate: document.getElementById('slideshowDate'),
    slideshowCounter: document.getElementById('slideshowCounter'),
    slideshowPrev: document.getElementById('slideshowPrev'),
    slideshowNext: document.getElementById('slideshowNext'),
    slideshowPlayPause: document.getElementById('slideshowPlayPause'),
    heartsContainer: document.getElementById('heartsContainer'),
    particleCanvas: document.getElementById('particleCanvas'),
    videoSection: document.getElementById('videoSection'),
    memoryVideo: document.getElementById('memoryVideo'),
    finalMessage: document.getElementById('finalMessage')
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadImageData();
        setupEventListeners();
        createFloatingHearts();
        initializeParticles();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

// ============================================
// Data Loading
// ============================================

async function loadImageData() {
    try {
        const response = await fetch('images.json');
        const data = await response.json();
        state.imageGroups = data.imageGroups;
        
        // Flatten all images for easy navigation
        data.imageGroups.forEach(group => {
            group.images.forEach(image => {
                state.allImages.push({
                    path: `assets/images/${image}`,
                    date: group.displayDate
                });
            });
        });

        // Add videos
        if (data.videos && data.videos.length > 0) {
            data.videos.forEach(video => {
                state.allImages.push({
                    path: `assets/videos/${video}`,
                    date: 'Special Video',
                    isVideo: true
                });
            });
        }
    } catch (error) {
        console.error('Error loading images.json:', error);
    }
}

// ============================================
// Event Listeners Setup
// ============================================

function setupEventListeners() {
    // "No" button evasion - track mouse movement globally
    document.addEventListener('mousemove', handleMouseMove);
    
    // Prevent any click on the No button
    elements.noBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        moveNoButtonAway(e.clientX, e.clientY);
    });
    
    elements.noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
    // Touch support for mobile
    elements.noBtn.addEventListener('touchstart', handleNoButtonTouch, { passive: false });
    elements.noBtn.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        moveNoButtonAway(touch.clientX, touch.clientY);
    }, { passive: false });

    // "Yes" button
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

    // Drag/swipe for cards
    elements.cardContainer.addEventListener('mousedown', handleDragStart);
    elements.cardContainer.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);

    // Slideshow controls
    elements.slideshowPrev.addEventListener('click', () => navigateSlideshow(-1));
    elements.slideshowNext.addEventListener('click', () => navigateSlideshow(1));
    elements.slideshowPlayPause.addEventListener('click', toggleSlideshowPlayPause);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
}

// ============================================
// "No" Button Evasion Logic
// ============================================

let lastMoveTime = 0;
const moveThrottle = 200; // Minimum time between moves in milliseconds

function handleMouseMove(e) {
    if (!elements.noBtn || elements.questionScreen.classList.contains('hidden')) return;

    // Throttle the move function to prevent too frequent updates
    const now = Date.now();
    if (now - lastMoveTime < moveThrottle) return;

    const btn = elements.noBtn;
    const btnRect = btn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const distance = Math.sqrt(
        Math.pow(e.clientX - btnCenterX, 2) + 
        Math.pow(e.clientY - btnCenterY, 2)
    );

    // If cursor is too close, move the button away
    if (distance < CONFIG.noBtnEvasionDistance) {
        moveNoButtonAway(e.clientX, e.clientY);
        lastMoveTime = now;
    }
}

function handleNoButtonTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    moveNoButtonAway(touch.clientX, touch.clientY);
}

function moveNoButtonAway(cursorX, cursorY) {
    const btn = elements.noBtn;
    const container = elements.questionScreen;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // Calculate button center
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    // Calculate angle away from cursor
    const angleFromCursor = Math.atan2(btnCenterY - cursorY, btnCenterX - cursorX);
    
    // Add some randomness to the angle (±30 degrees)
    const randomAngleOffset = (Math.random() - 0.5) * Math.PI / 3;
    const finalAngle = angleFromCursor + randomAngleOffset;
    
    // Calculate new position away from cursor
    const moveDistance = 200; // How far to move
    let newX = btnCenterX + Math.cos(finalAngle) * moveDistance - btnRect.width / 2;
    let newY = btnCenterY + Math.sin(finalAngle) * moveDistance - btnRect.height / 2;

    // Ensure button stays within container bounds
    const padding = 20;
    const minX = padding;
    const maxX = containerRect.width - btnRect.width - padding;
    const minY = padding;
    const maxY = containerRect.height - btnRect.height - padding;

    // Clamp values to keep button in bounds
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    // Apply new position with smooth animation
    btn.style.position = 'absolute';
    btn.style.left = `${newX}px`;
    btn.style.top = `${newY}px`;
    btn.style.transition = 'left 0.3s ease-out, top 0.3s ease-out';
    
    // Force visibility
    btn.style.opacity = '1';
    btn.style.visibility = 'visible';
    btn.style.display = 'inline-block';
    btn.style.pointerEvents = 'auto';
}

// ============================================
// "Yes" Button Action
// ============================================

function handleYesClick() {
    // Create confetti effect
    createConfetti();

    // Transition to menu
    setTimeout(() => {
        elements.questionScreen.classList.add('hidden');
        elements.menuScreen.classList.remove('hidden');
        elements.menuScreen.classList.add('fade-in');
        
        // Schedule final message
        setTimeout(() => {
            showFinalMessage();
        }, CONFIG.finalMessageDelay);
    }, 500);
}

// ============================================
// Mode Selection
// ============================================

function showMode(mode) {
    state.currentMode = mode;
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
    // Stop slideshow if running
    if (state.slideshowTimer) {
        clearInterval(state.slideshowTimer);
        state.slideshowTimer = null;
    }

    // Reset state
    state.currentIndex = 0;
    state.currentMode = null;

    // Hide current screen and show menu
    elements.galleryScreen.classList.add('hidden');
    elements.slideshowScreen.classList.add('hidden');
    elements.menuScreen.classList.remove('hidden');
}

// ============================================
// Gallery Mode (Cards)
// ============================================

function initializeGallery() {
    if (state.allImages.length === 0) {
        console.error('No images loaded');
        return;
    }

    state.currentIndex = 0;
    createProgressDots();
    loadCurrentImage();
    updateNavigationButtons();
}

function createProgressDots() {
    elements.progressDots.innerHTML = '';
    state.allImages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => jumpToImage(index));
        elements.progressDots.appendChild(dot);
    });
}

function loadCurrentImage() {
    const current = state.allImages[state.currentIndex];
    
    if (current.isVideo) {
        // Show video
        elements.cardContainer.style.display = 'none';
        elements.videoSection.classList.remove('hidden');
        elements.memoryVideo.src = current.path;
        elements.currentDate.textContent = current.date;
    } else {
        // Show image
        elements.videoSection.classList.add('hidden');
        elements.cardContainer.style.display = 'block';
        elements.cardImage.src = current.path;
        elements.currentDate.textContent = current.date;
    }

    updateProgressDots();
}

function updateProgressDots() {
    const dots = elements.progressDots.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === state.currentIndex);
    });
}

function updateNavigationButtons() {
    elements.prevBtn.disabled = state.currentIndex === 0;
    elements.nextBtn.disabled = state.currentIndex === state.allImages.length - 1;
}

function navigateCard(direction) {
    const newIndex = state.currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < state.allImages.length) {
        // Animate card transition
        const card = elements.mainCard;
        card.style.transform = `rotateY(${direction * 90}deg)`;
        
        setTimeout(() => {
            state.currentIndex = newIndex;
            loadCurrentImage();
            updateNavigationButtons();
            card.style.transform = 'rotateY(0deg)';
        }, 300);
    }
}

function jumpToImage(index) {
    if (index !== state.currentIndex && index >= 0 && index < state.allImages.length) {
        const direction = index > state.currentIndex ? 1 : -1;
        state.currentIndex = index;
        navigateCard(0);
    }
}

// ============================================
// Drag and Swipe Functionality (Cards)
// ============================================

function handleDragStart(e) {
    if (state.currentMode !== 'cards') return;
    state.isDragging = true;
    state.startX = e.clientX;
    elements.cardContainer.style.cursor = 'grabbing';
}

function handleTouchStart(e) {
    if (state.currentMode !== 'cards') return;
    state.isDragging = true;
    state.startX = e.touches[0].clientX;
}

function handleDragMove(e) {
    if (!state.isDragging || state.currentMode !== 'cards') return;
    
    state.currentX = e.clientX;
    const deltaX = state.currentX - state.startX;
    const rotateY = deltaX * 0.1;
    
    elements.mainCard.style.transform = `rotateY(${rotateY}deg)`;
}

function handleTouchMove(e) {
    if (!state.isDragging || state.currentMode !== 'cards') return;
    
    state.currentX = e.touches[0].clientX;
    const deltaX = state.currentX - state.startX;
    const rotateY = deltaX * 0.1;
    
    elements.mainCard.style.transform = `rotateY(${rotateY}deg)`;
}

function handleDragEnd() {
    if (!state.isDragging || state.currentMode !== 'cards') return;
    
    state.isDragging = false;
    elements.cardContainer.style.cursor = 'grab';
    
    const deltaX = state.currentX - state.startX;
    
    if (Math.abs(deltaX) > CONFIG.swipeThreshold) {
        if (deltaX > 0) {
            navigateCard(-1); // Swipe right = previous
        } else {
            navigateCard(1); // Swipe left = next
        }
    } else {
        // Reset card position
        elements.mainCard.style.transform = 'rotateY(0deg)';
    }
    
    state.startX = 0;
    state.currentX = 0;
}

// ============================================
// Slideshow Mode
// ============================================

function initializeSlideshow() {
    if (state.allImages.length === 0) {
        console.error('No images loaded');
        return;
    }

    state.currentIndex = 0;
    state.slideshowPlaying = true;
    loadSlideshowImage();
    startSlideshow();
}

function loadSlideshowImage() {
    const current = state.allImages[state.currentIndex];
    
    // Only show images in slideshow, skip videos
    if (current.isVideo) {
        navigateSlideshow(1);
        return;
    }

    elements.slideshowImage.src = current.path;
    elements.slideshowDate.textContent = current.date;
    elements.slideshowCounter.textContent = `${state.currentIndex + 1} / ${state.allImages.length}`;
}

function navigateSlideshow(direction) {
    let newIndex = state.currentIndex + direction;
    
    // Loop around
    if (newIndex < 0) {
        newIndex = state.allImages.length - 1;
    } else if (newIndex >= state.allImages.length) {
        newIndex = 0;
    }
    
    state.currentIndex = newIndex;
    loadSlideshowImage();
}

function startSlideshow() {
    if (state.slideshowTimer) {
        clearInterval(state.slideshowTimer);
    }
    
    state.slideshowTimer = setInterval(() => {
        if (state.slideshowPlaying) {
            navigateSlideshow(1);
        }
    }, CONFIG.slideshowInterval);
}

function toggleSlideshowPlayPause() {
    state.slideshowPlaying = !state.slideshowPlaying;
    elements.slideshowPlayPause.textContent = state.slideshowPlaying ? '⏸' : '▶';
}

// ============================================
// Keyboard Navigation
// ============================================

function handleKeyPress(e) {
    if (state.currentMode === 'cards' && !elements.galleryScreen.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') {
            navigateCard(-1);
        } else if (e.key === 'ArrowRight') {
            navigateCard(1);
        }
    } else if (state.currentMode === 'slideshow' && !elements.slideshowScreen.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') {
            navigateSlideshow(-1);
        } else if (e.key === 'ArrowRight') {
            navigateSlideshow(1);
        } else if (e.key === ' ') {
            e.preventDefault();
            toggleSlideshowPlayPause();
        }
    }
}

// ============================================
// Floating Hearts Animation
// ============================================

function createFloatingHearts() {
    const hearts = ['💕', '💖', '💗', '💘', '💝', '❤️', '💓'];
    
    setInterval(() => {
        if (elements.heartsContainer.children.length < CONFIG.heartCount) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = (Math.random() * 4 + 4) + 's';
            heart.style.animationDelay = Math.random() * 2 + 's';
            
            elements.heartsContainer.appendChild(heart);
            
            setTimeout(() => {
                heart.remove();
            }, 8000);
        }
    }, 400);
}

// ============================================
// Particle System
// ============================================

function initializeParticles() {
    const canvas = elements.particleCanvas;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = `rgba(255, ${Math.random() * 100 + 100}, ${Math.random() * 100 + 150}, ${Math.random() * 0.5 + 0.3})`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ============================================
// Confetti Effect
// ============================================

function createConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ffb6d9', '#fff', '#ffd700'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.borderRadius = '50%';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { 
                transform: `translate(0, 0) rotate(0deg)`,
                opacity: 1 
            },
            { 
                transform: `translate(${Math.random() * 200 - 100}px, ${window.innerHeight + 10}px) rotate(${Math.random() * 720}deg)`,
                opacity: 0 
            }
        ], {
            duration: Math.random() * 2000 + 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// ============================================
// Final Message
// ============================================

function showFinalMessage() {
    elements.finalMessage.classList.remove('hidden');
    
    setTimeout(() => {
        elements.finalMessage.classList.add('fade-out');
        
        setTimeout(() => {
            elements.finalMessage.classList.add('hidden');
            elements.finalMessage.classList.remove('fade-out');
        }, 2000);
    }, CONFIG.finalMessageDuration);
}
