async function loadImageData() {
    try {
        const response = await fetch('images.json', {
            cache: 'no-store'
        });
        const data = await response.json();
        state.imageGroups = data.imageGroups;
        
        data.imageGroups.forEach(group => {
            group.images.forEach(image => {
                state.allImages.push({
                    path: `assets/images/${image}`,
                    date: group.displayDate
                });
            });
        });

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
