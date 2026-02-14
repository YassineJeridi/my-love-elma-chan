let currentOffsetX = 0;
let currentOffsetY = 0;

function setupNoButton() {
    const btn = elements.noBtn;
    const questionContainer = document.querySelector('.question-container');
    
    // Track mouse movement to evade cursor before it reaches the button
    questionContainer.addEventListener('mousemove', (e) => {
        evadeFromCursor(e.clientX, e.clientY);
    });
    
    // Prevent click
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        return false;
    });
    
    btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Touch support - evade from touch position
    questionContainer.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        evadeFromCursor(touch.clientX, touch.clientY);
    }, { passive: true });
    
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        return false;
    }, { passive: false });
}

function evadeFromCursor(cursorX, cursorY) {
    const btn = elements.noBtn;
    const btnRect = btn.getBoundingClientRect();
    const questionContainer = document.querySelector('.question-container');
    const containerRect = questionContainer.getBoundingClientRect();
    
    // Button center position
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    
    // Distance from cursor to button center
    const distX = btnCenterX - cursorX;
    const distY = btnCenterY - cursorY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    // Evasion radius - button moves away when cursor is within this distance
    const evasionRadius = 120;
    
    if (distance < evasionRadius && distance > 0) {
        // Calculate escape direction (away from cursor)
        const escapeX = distX / distance;
        const escapeY = distY / distance;
        
        // Escape distance based on how close the cursor is
        const escapeStrength = (evasionRadius - distance) * 0.8;
        
        // Update offsets
        currentOffsetX += escapeX * escapeStrength * 0.3;
        currentOffsetY += escapeY * escapeStrength * 0.3;
        
        // Constrain within the question container bounds
        const maxOffsetX = 120;
        const maxOffsetY = 80;
        currentOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, currentOffsetX));
        currentOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, currentOffsetY));
        
        // Apply position with smooth transition
        btn.style.position = 'relative';
        btn.style.transform = `translate(${currentOffsetX}px, ${currentOffsetY}px)`;
        btn.style.transition = 'transform 0.15s ease-out';
    }
}
