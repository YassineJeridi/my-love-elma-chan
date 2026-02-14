document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadImageData();
        setupNoButton();
        setupNavigation();
        createFloatingHearts();
        initializeParticles();
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
});
