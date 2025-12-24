document.addEventListener('DOMContentLoaded', function () {
    const stackedImages = document.querySelectorAll('.stacked-image');
    const stackedContainer = document.querySelector('.stacked-images-container');
    const videoTextFrame = document.getElementById('videoTextFrame');
    let highestZIndex = 10;
    let lowestZIndex = 1;
    let isAnimating = false;
    let animationInterval = null;

    // Map data-index to text
    const imageTexts = {
        0: 'ульяна\nдедушкина открытка',
        1: 'артём\nкленовые листья бабушки и дедушки',
        2: 'белла\nлапка от брата',
        3: 'ваня\nстена открыток'
    };

    // Function to update text frame with top image text
    function updateTextFrame() {
        // Find current top image
        let maxZ = -Infinity;
        let topImg = null;
        stackedImages.forEach(i => {
            const z = parseInt(window.getComputedStyle(i).zIndex) || 0;
            if (z > maxZ) {
                maxZ = z;
                topImg = i;
            }
        });

        if (topImg) {
            const index = parseInt(topImg.getAttribute('data-index'));
            videoTextFrame.textContent = imageTexts[index];
        }
    }

    // Initialize z-index - first image on top
    stackedImages.forEach((img, index) => {
        img.style.zIndex = highestZIndex - index;
    });

    // Initialize text frame
    updateTextFrame();

    // Function to get random angle
    function getRandomAngle() {
        return Math.floor(Math.random() * 16) - 8; // -8 to 8 degrees
    }

    // Hover effect - random angle for ALL images
    stackedContainer.addEventListener('mouseenter', function() {
        stackedImages.forEach(img => {
            const randomAngle = getRandomAngle();
            img.style.setProperty('--random-angle', `${randomAngle}deg`);
        });
    });

    stackedContainer.addEventListener('mouseleave', function() {
        stackedImages.forEach(img => {
            img.style.setProperty('--random-angle', '0deg');
        });
    });

    // Function to move top image to bottom
    function moveTopToBottom() {
        // Find current top image and second top image
        let maxZ = -Infinity;
        let secondMaxZ = -Infinity;
        let topImg = null;
        let nextTopImg = null;
        
        stackedImages.forEach(i => {
            const z = parseInt(window.getComputedStyle(i).zIndex) || 0;
            if (z > maxZ) {
                secondMaxZ = maxZ;
                nextTopImg = topImg;
                maxZ = z;
                topImg = i;
            } else if (z > secondMaxZ) {
                secondMaxZ = z;
                nextTopImg = i;
            }
        });

        if (topImg) {
            // Find current lowest z-index
            let minZ = Infinity;
            stackedImages.forEach(i => {
                const z = parseInt(window.getComputedStyle(i).zIndex) || 0;
                if (z < minZ) {
                    minZ = z;
                }
            });
            
            // Move top image to bottom (one below the current lowest)
            topImg.style.zIndex = minZ - 1;
            
            // Update text frame with the new top image (the one that was second)
            if (nextTopImg) {
                const index = parseInt(nextTopImg.getAttribute('data-index'));
                videoTextFrame.textContent = imageTexts[index];
            } else {
                // Fallback: update after a brief delay
                requestAnimationFrame(() => {
                    updateTextFrame();
                });
            }
        }
    }

    // Click effect - cycle through images on each click
    stackedContainer.addEventListener('click', function() {
        moveTopToBottom();
    });

    // Toggle between text frame and video container on dom.png click
    const domImage = document.querySelector('.index-dom');
    const videoContainer = document.querySelector('.video-container');
    let showVideo = true; // Start with video visible

    domImage.style.cursor = 'pointer';

    domImage.addEventListener('click', function() {
        showVideo = !showVideo;
        
        if (showVideo) {
            videoTextFrame.style.display = 'none';
            videoContainer.style.display = 'block';
        } else {
            videoTextFrame.style.display = 'block';
            videoContainer.style.display = 'none';
        }
    });
});

