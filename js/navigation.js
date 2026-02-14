function setupNavigation() {
    // Yes button
    elements.yesBtn.addEventListener('click', () => {
        createConfetti();
        setTimeout(() => {
            elements.questionScreen.classList.add('hidden');
            elements.menuScreen.classList.remove('hidden');
            elements.menuScreen.classList.add('fade-in');
            setTimeout(() => showFinalMessage(), CONFIG.finalMessageDelay);
        }, 500);
    });
    
    // Menu buttons
    elements.cardsBtn.addEventListener('click', () => showMode('cards'));
    elements.slideshowBtn.addEventListener('click', () => showMode('slideshow'));
    
    // Back buttons
    elements.backFromGallery.addEventListener('click', backToMenu);
    elements.backFromSlideshow.addEventListener('click', backToMenu);
    
    // Gallery navigation
    elements.prevBtn.addEventListener('click', () => navigateCard(-1));
    elements.nextBtn.addEventListener('click', () => navigateCard(1));
    
    // Slideshow controls
    elements.slideshowPrev.addEventListener('click', () => navigateSlideshow(-1));
    elements.slideshowNext.addEventListener('click', () => navigateSlideshow(1));
    elements.slideshowPlayPause.addEventListener('click', toggleSlideshowPlayPause);
    
    // Card dragging
    setupCardDragging();
    
    // Keyboard
    document.addEventListener('keydown', handleKeyPress);
}

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
    if (state.slideshowTimer) {
        clearInterval(state.slideshowTimer);
        state.slideshowTimer = null;
    }
    
    state.currentIndex = 0;
    state.currentMode = null;
    
    elements.galleryScreen.classList.add('hidden');
    elements.slideshowScreen.classList.add('hidden');
    elements.menuScreen.classList.remove('hidden');
}

function setupCardDragging() {
    elements.cardContainer.addEventListener('mousedown', (e) => {
        if (state.currentMode !== 'cards') return;
        state.isDragging = true;
        state.startX = e.clientX;
        elements.cardContainer.style.cursor = 'grabbing';
    });
    
    elements.cardContainer.addEventListener('touchstart', (e) => {
        if (state.currentMode !== 'cards') return;
        state.isDragging = true;
        state.startX = e.touches[0].clientX;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!state.isDragging || state.currentMode !== 'cards') return;
        state.currentX = e.clientX;
        const deltaX = state.currentX - state.startX;
        elements.mainCard.style.transform = `rotateY(${deltaX * 0.1}deg)`;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!state.isDragging || state.currentMode !== 'cards') return;
        state.currentX = e.touches[0].clientX;
        const deltaX = state.currentX - state.startX;
        elements.mainCard.style.transform = `rotateY(${deltaX * 0.1}deg)`;
    });
    
    const handleDragEnd = () => {
        if (!state.isDragging || state.currentMode !== 'cards') return;
        
        state.isDragging = false;
        elements.cardContainer.style.cursor = 'grab';
        
        const deltaX = state.currentX - state.startX;
        
        if (Math.abs(deltaX) > CONFIG.swipeThreshold) {
            navigateCard(deltaX > 0 ? -1 : 1);
        } else {
            elements.mainCard.style.transform = 'rotateY(0deg)';
        }
        
        state.startX = 0;
        state.currentX = 0;
    };
    
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
}

function handleKeyPress(e) {
    if (state.currentMode === 'cards' && !elements.galleryScreen.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') navigateCard(-1);
        else if (e.key === 'ArrowRight') navigateCard(1);
    } else if (state.currentMode === 'slideshow' && !elements.slideshowScreen.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') navigateSlideshow(-1);
        else if (e.key === 'ArrowRight') navigateSlideshow(1);
        else if (e.key === ' ') {
            e.preventDefault();
            toggleSlideshowPlayPause();
        }
    }
}
