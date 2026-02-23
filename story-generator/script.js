// Gallery functionality & Editability

document.addEventListener("DOMContentLoaded", () => {
    // 1. Make all text elements editable
    const textSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'span',
        '.bg-typo', '.script-overlay', '.d-month', '.d-sub', '.d-num',
        '.input-mock', '.marker-text', '.barcode', '.link-item',
        '.dropcap', '.text', 'button'
    ];

    const textElements = document.querySelectorAll(
        textSelectors.map(s => `.profile-card ${s}`).join(', ')
    );

    textElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        // Add subtle hover effect to indicate editability
        el.style.outline = 'none';
        el.addEventListener('focus', () => {
            el.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.3)';
            el.style.borderRadius = '4px';
        });
        el.addEventListener('blur', () => {
            el.style.boxShadow = 'none';
        });
        // Prevent linking/navigation when clicking to edit
        el.addEventListener('click', (e) => e.preventDefault());
    });

    // 2. Make all images editable via click
    const images = document.querySelectorAll('.profile-card img');
    images.forEach(img => {
        img.style.cursor = 'pointer';
        img.title = 'Click to replace image';
        img.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUrl = img.src;
            const newUrl = prompt('Enter new image URL to replace this one:', currentUrl);
            if (newUrl && newUrl.trim() !== '') {
                img.src = newUrl.trim();
            }
        });

        // Add a subtle hover effect for images too
        img.addEventListener('mouseenter', () => {
            img.style.opacity = '0.9';
            img.style.outline = '3px solid rgba(79, 70, 229, 0.5)';
        });
        img.addEventListener('mouseleave', () => {
            img.style.opacity = '1';
            img.style.outline = 'none';
        });
    });

    // 3. Category Filtering
    const filterButtons = document.querySelectorAll('.pill-nav .pill');
    const cards = document.querySelectorAll('.profile-card');

    // Auto-categorize cards based on class names for those generated dynamically or sequentially
    cards.forEach(card => {
        if (!card.classList.contains('filter-bday') &&
            !card.classList.contains('filter-misc')) {
            // Check for premium editorial (1-50)
            if (Array.from(card.classList).some(cls => cls.startsWith('card-bday-edit-'))) {
                card.classList.add('filter-premium');
            }
            // Check for purple floral (51-100)
            else if (Array.from(card.classList).some(cls => cls.startsWith('card-purple-edit-'))) {
                card.classList.add('filter-floral');
            }
        }
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            cards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else if (card.classList.contains('filter-' + filterValue)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 4. Add Download & Share overlays to each card
    cards.forEach(card => {
        // Create an actions container
        const actionOverlay = document.createElement('div');
        actionOverlay.className = 'card-actions';

        // ⬇️ Download Button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'action-btn download-btn';
        downloadBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg> Download
        `;

        // 📤 Share Button
        const shareBtn = document.createElement('button');
        shareBtn.className = 'action-btn share-btn';
        shareBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg> IG Story
        `;

        actionOverlay.appendChild(downloadBtn);
        actionOverlay.appendChild(shareBtn);
        card.appendChild(actionOverlay);

        // Core Capture Function returning a Promise(Canvas)
        const captureCard = async () => {
            // Hide the buttons so they don't appear in the screenshot
            actionOverlay.style.opacity = '0';
            await new Promise(r => setTimeout(r, 50));

            try {
                const canvas = await html2canvas(card, {
                    scale: 3, // High-res capture
                    useCORS: true,
                    backgroundColor: null,
                });
                return canvas;
            } finally {
                // Restore the buttons immediately
                actionOverlay.style.opacity = '1';
            }
        };

        // Download Action
        downloadBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const canvas = await captureCard();
                const link = document.createElement('a');
                link.download = `story-card-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Error generating image:", err);
                alert("Could not generate image. Check console for details.");
            }
        });

        // Share Action (Native web share, targets Instagram on mobile native share sheets)
        shareBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const canvas = await captureCard();
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], `story-card-${Date.now()}.png`, { type: 'image/png' });

                    // Check if device supports sharing files (iOS Safari, Android Chrome, etc)
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'My Story Card',
                                text: 'Check out my new card!'
                            });
                        } catch (shareErr) {
                            console.log("Share skipped or failed:", shareErr);
                        }
                    } else {
                        // Desktop fallback
                        alert("Your browser doesn't support sharing image files directly to apps. Please use the Download button instead and post manually.");
                    }
                }, 'image/png');

            } catch (err) {
                console.error("Error generating image for share:", err);
                alert("Could not generate image. Check console for details.");
            }
        });
    });
});
