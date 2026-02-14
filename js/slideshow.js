function initializeSlideshow() {
    if (state.allImages.length === 0) return;
    
    state.currentIndex = 0;
    state.slideshowPlaying = true;
    loadSlideshowImage();
    startSlideshow();
}

function loadSlideshowImage() {
    const current = state.allImages[state.currentIndex];
    
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
    
    if (newIndex < 0) newIndex = state.allImages.length - 1;
    else if (newIndex >= state.allImages.length) newIndex = 0;
    
    state.currentIndex = newIndex;
    loadSlideshowImage();
}

function startSlideshow() {
    if (state.slideshowTimer) clearInterval(state.slideshowTimer);
    
    state.slideshowTimer = setInterval(() => {
        if (state.slideshowPlaying) navigateSlideshow(1);
    }, CONFIG.slideshowInterval);
}

function toggleSlideshowPlayPause() {
    state.slideshowPlaying = !state.slideshowPlaying;
    elements.slideshowPlayPause.textContent = state.slideshowPlaying ? '⏸' : '▶';
}
