/* =============================================
   和日月 - Blog Page JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ===== Category Filter =====
    const filterTags = document.querySelectorAll('.filter-tag');
    const blogCards = document.querySelectorAll('.blog-card[data-category]');

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Update active tag
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            const filter = tag.dataset.filter;

            blogCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                    // Re-trigger animation
                    card.classList.remove('is-visible');
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            card.classList.add('is-visible');
                        });
                    });
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
});
