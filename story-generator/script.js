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
});
