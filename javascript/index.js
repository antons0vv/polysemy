document.addEventListener('DOMContentLoaded', function () {
    const stackedImages = document.querySelectorAll('.stacked-image');
    const stackedContainer = document.querySelector('.stacked-images-container');
    const videoTextFrame = document.getElementById('videoTextFrame');
    let highestZIndex = 10;
    let currentZIndex = 100;
    let isDraggingStacked = false;

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

    // Click effect - cycle through images on each click (only if not dragging)
    stackedContainer.addEventListener('click', function(e) {
        if (!isDraggingStacked) {
            moveTopToBottom();
        }
    });

    // Toggle between text frame and video container on toggle-video click
    const toggleElement = document.querySelector('.toggle-video');
    const videoContainer = document.querySelector('.video-container');
    const videoTextFrameContainer = document.querySelector('.video-text-frame-container');
    let showVideo = true; // Start with video visible

    if (toggleElement) {
        toggleElement.style.cursor = 'pointer';

        toggleElement.addEventListener('click', function(e) {
            // Don't toggle if we just dragged
            if (!toggleElement.dataset.justDragged) {
                showVideo = !showVideo;
                
                if (showVideo) {
                    videoTextFrameContainer.classList.remove('show');
                    videoContainer.style.display = 'block';
                } else {
                    videoTextFrameContainer.classList.add('show');
                    videoContainer.style.display = 'none';
                }
            }
            delete toggleElement.dataset.justDragged;
        });
    }

    // Setup interact.js for dragging
    if (typeof interact !== 'undefined') {
        const container = document.querySelector('.index-container');
        const containerRect = container.getBoundingClientRect();

        // Make text cards draggable
        const textCards = document.querySelectorAll('.text-card');
        textCards.forEach(card => {
            let initialLeft, initialTop;
            
            interact(card)
                .draggable({
                    listeners: {
                        start(event) {
                            currentZIndex++;
                            event.target.style.zIndex = currentZIndex;
                            // Convert to absolute positioning
                            const rect = event.target.getBoundingClientRect();
                            const containerRect = container.getBoundingClientRect();
                            initialLeft = rect.left - containerRect.left;
                            initialTop = rect.top - containerRect.top;
                            event.target.style.position = 'absolute';
                            event.target.style.left = `${initialLeft}px`;
                            event.target.style.top = `${initialTop}px`;
                            event.target.style.margin = '0';
                            const currentX = parseFloat(event.target.getAttribute('data-x')) || initialLeft;
                            const currentY = parseFloat(event.target.getAttribute('data-y')) || initialTop;
                            event.target.setAttribute('data-x', currentX);
                            event.target.setAttribute('data-y', currentY);
                        },
                        move(event) {
                            const target = event.target;
                            const currentX = parseFloat(target.getAttribute('data-x')) || initialLeft;
                            const currentY = parseFloat(target.getAttribute('data-y')) || initialTop;
                            const x = currentX + event.dx;
                            const y = currentY + event.dy;
                            
                            // Constrain within container
                            const containerRect = container.getBoundingClientRect();
                            const targetRect = target.getBoundingClientRect();
                            const maxX = containerRect.width - targetRect.width;
                            const maxY = containerRect.height - targetRect.height;
                            
                            const constrainedX = Math.max(0, Math.min(x, maxX));
                            const constrainedY = Math.max(0, Math.min(y, maxY));
                            
                            target.style.left = `${constrainedX}px`;
                            target.style.top = `${constrainedY}px`;
                            target.setAttribute('data-x', constrainedX);
                            target.setAttribute('data-y', constrainedY);
                        },
                        end(event) {
                            if (event.target.classList.contains('toggle-video')) {
                                event.target.dataset.justDragged = 'true';
                            }
                        }
                    },
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: container,
                            endOnly: true
                        })
                    ]
                });
        });

        // Make video wrapper draggable
        const videoWrapper = document.querySelector('.video-wrapper');
        if (videoWrapper) {
            let initialLeft, initialTop;
            
            interact(videoWrapper)
                .draggable({
                    listeners: {
                        start(event) {
                            currentZIndex++;
                            event.target.style.zIndex = currentZIndex;
                            // Convert to absolute positioning
                            const rect = event.target.getBoundingClientRect();
                            const containerRect = container.getBoundingClientRect();
                            initialLeft = rect.left - containerRect.left;
                            initialTop = rect.top - containerRect.top;
                            event.target.style.position = 'absolute';
                            event.target.style.left = `${initialLeft}px`;
                            event.target.style.top = `${initialTop}px`;
                            event.target.style.marginLeft = 'auto';
                            const currentX = parseFloat(event.target.getAttribute('data-x')) || initialLeft;
                            const currentY = parseFloat(event.target.getAttribute('data-y')) || initialTop;
                            event.target.setAttribute('data-x', currentX);
                            event.target.setAttribute('data-y', currentY);
                        },
                        move(event) {
                            const target = event.target;
                            const currentX = parseFloat(target.getAttribute('data-x')) || initialLeft;
                            const currentY = parseFloat(target.getAttribute('data-y')) || initialTop;
                            const x = currentX + event.dx;
                            const y = currentY + event.dy;
                            
                            const containerRect = container.getBoundingClientRect();
                            const targetRect = target.getBoundingClientRect();
                            const maxX = containerRect.width - targetRect.width;
                            const maxY = containerRect.height - targetRect.height;
                            
                            const constrainedX = Math.max(0, Math.min(x, maxX));
                            const constrainedY = Math.max(0, Math.min(y, maxY));
                            
                            target.style.left = `${constrainedX}px`;
                            target.style.top = `${constrainedY}px`;
                            target.setAttribute('data-x', constrainedX);
                            target.setAttribute('data-y', constrainedY);
                        }
                    },
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: container,
                            endOnly: true
                        })
                    ]
                });
        }

        // Make video text frame container draggable
        if (videoTextFrameContainer) {
            let initialLeft, initialTop;
            
            interact(videoTextFrameContainer)
                .draggable({
                    listeners: {
                        start(event) {
                            currentZIndex++;
                            event.target.style.zIndex = currentZIndex;
                            // Convert to absolute positioning
                            const rect = event.target.getBoundingClientRect();
                            const containerRect = container.getBoundingClientRect();
                            initialLeft = rect.left - containerRect.left;
                            initialTop = rect.top - containerRect.top;
                            event.target.style.position = 'absolute';
                            event.target.style.left = `${initialLeft}px`;
                            event.target.style.top = `${initialTop}px`;
                            const currentX = parseFloat(event.target.getAttribute('data-x')) || initialLeft;
                            const currentY = parseFloat(event.target.getAttribute('data-y')) || initialTop;
                            event.target.setAttribute('data-x', currentX);
                            event.target.setAttribute('data-y', currentY);
                        },
                        move(event) {
                            const target = event.target;
                            const currentX = parseFloat(target.getAttribute('data-x')) || initialLeft;
                            const currentY = parseFloat(target.getAttribute('data-y')) || initialTop;
                            const x = currentX + event.dx;
                            const y = currentY + event.dy;
                            
                            const containerRect = container.getBoundingClientRect();
                            const targetRect = target.getBoundingClientRect();
                            const maxX = containerRect.width - targetRect.width;
                            const maxY = containerRect.height - targetRect.height;
                            
                            const constrainedX = Math.max(0, Math.min(x, maxX));
                            const constrainedY = Math.max(0, Math.min(y, maxY));
                            
                            target.style.left = `${constrainedX}px`;
                            target.style.top = `${constrainedY}px`;
                            target.setAttribute('data-x', constrainedX);
                            target.setAttribute('data-y', constrainedY);
                        }
                    },
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: container,
                            endOnly: true
                        })
                    ]
                });
        }

        // Make stacked images container draggable
        if (stackedContainer) {
            let initialLeft, initialTop;
            
            interact(stackedContainer)
                .draggable({
                    listeners: {
                        start(event) {
                            currentZIndex++;
                            event.target.style.zIndex = currentZIndex;
                            // Convert to absolute positioning
                            const rect = event.target.getBoundingClientRect();
                            const containerRect = container.getBoundingClientRect();
                            initialLeft = rect.left - containerRect.left;
                            initialTop = rect.top - containerRect.top;
                            event.target.style.position = 'absolute';
                            event.target.style.left = `${initialLeft}px`;
                            event.target.style.top = `${initialTop}px`;
                            const currentX = parseFloat(event.target.getAttribute('data-x')) || initialLeft;
                            const currentY = parseFloat(event.target.getAttribute('data-y')) || initialTop;
                            event.target.setAttribute('data-x', currentX);
                            event.target.setAttribute('data-y', currentY);
                            isDraggingStacked = true;
                        },
                        move(event) {
                            const target = event.target;
                            const currentX = parseFloat(target.getAttribute('data-x')) || initialLeft;
                            const currentY = parseFloat(target.getAttribute('data-y')) || initialTop;
                            const x = currentX + event.dx;
                            const y = currentY + event.dy;
                            
                            const containerRect = container.getBoundingClientRect();
                            const targetRect = target.getBoundingClientRect();
                            const maxX = containerRect.width - targetRect.width;
                            const maxY = containerRect.height - targetRect.height;
                            
                            const constrainedX = Math.max(0, Math.min(x, maxX));
                            const constrainedY = Math.max(0, Math.min(y, maxY));
                            
                            target.style.left = `${constrainedX}px`;
                            target.style.top = `${constrainedY}px`;
                            target.setAttribute('data-x', constrainedX);
                            target.setAttribute('data-y', constrainedY);
                        },
                        end(event) {
                            setTimeout(() => {
                                isDraggingStacked = false;
                            }, 100);
                        }
                    },
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: container,
                            endOnly: true
                        })
                    ]
                });
        }

        // Note: Individual stacked images are not draggable to preserve stacking behavior
        // Only the container is draggable
    }
});
