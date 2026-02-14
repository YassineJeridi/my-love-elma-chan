function initializeGallery() {
    if (state.allImages.length === 0) return;
    
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
        elements.cardContainer.style.display = 'none';
        elements.videoSection.classList.remove('hidden');
        elements.memoryVideo.src = current.path;
        elements.currentDate.textContent = current.date;
    } else {
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
        state.currentIndex = index;
        navigateCard(0);
    }
}
