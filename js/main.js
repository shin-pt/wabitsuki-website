/* =============================================
   和日月（わびつき）- Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ===== 1. Header Scroll Effect =====
    const header = document.getElementById('header');
    const floatingCta = document.getElementById('floatingCta');
    const backToTop = document.getElementById('backToTop');

    let lastScroll = 0;
    const scrollThreshold = 100;

    function handleScroll() {
        const currentScroll = window.pageYOffset;

        // Header shadow
        if (currentScroll > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Floating CTA & Back to top
        if (currentScroll > scrollThreshold * 5) {
            floatingCta.classList.add('visible');
            backToTop.classList.add('visible');
        } else {
            floatingCta.classList.remove('visible');
            backToTop.classList.remove('visible');
        }

        lastScroll = currentScroll;
    }

    // Debounce scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(handleScroll);
    }, { passive: true });

    // ===== 2. Smooth Scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (!target) return;

            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            closeMobileMenu();
        });
    });

    // Back to top
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== 3. Hamburger Menu =====
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    let overlay = null;

    function createOverlay() {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMobileMenu);
    }

    function openMobileMenu() {
        hamburger.classList.add('active');
        mobileMenu.classList.add('active');
        if (!overlay) createOverlay();
        setTimeout(() => overlay.classList.add('active'), 10);
        // スマホで overflow:hidden によるレイアウトシフトを防ぐため、scrollPosition を保存して fixed で対応
        const scrollY = window.scrollY || window.pageYOffset;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        const scrollY = document.body.style.top ? Math.abs(parseInt(document.body.style.top, 10)) : 0;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, scrollY);
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Close menu on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ===== 4. FAQ Accordion =====
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherAnswer.style.maxHeight = null;
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle clicked item
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ===== 5. Scroll Animations (Intersection Observer) =====
    const animatedElements = document.querySelectorAll('.fade-in, [data-aos]');

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add stagger delay for grid items
                    const parent = entry.target.parentElement;
                    if (parent) {
                        const siblings = parent.querySelectorAll('.fade-in, [data-aos]');
                        const idx = Array.from(siblings).indexOf(entry.target);
                        entry.target.style.transitionDelay = `${idx * 0.1}s`;
                    }

                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback: show all elements
        animatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }

    // ===== 6. Active Navigation Link Highlight =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - header.offsetHeight - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateActiveNav);
    }, { passive: true });

    // ===== 7. Resize Handler =====
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Close mobile menu on resize to desktop
            if (window.innerWidth >= 1100) {
                closeMobileMenu();
            }
        }, 250);
    });

    // ===== 8. Preloader (initial animations) =====
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    // ===== 9. Lazy Load Images (if any real images are added) =====
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ===== 10. Console welcome message =====
    console.log('%c和日月（わびつき）', 'font-size: 20px; font-weight: bold; color: #8B7355;');
    console.log('%c心身をほどき、自分に還る場所', 'font-size: 12px; color: #C4A265;');
});
