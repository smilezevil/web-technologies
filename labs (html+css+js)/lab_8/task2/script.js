'use strict';

const nextIndex = (current, total, direction) =>
        (current + direction + total) % total;

const mergeConfig = (userConfig, defaults) => ({ ...defaults, ...userConfig });

const buildSlideHTML = slide => `
  <div class="slide" style="background:${slide.bg || '#1a1a2e'}">
    ${slide.img ? `<img src="${slide.img}" alt="${slide.title || ''}" loading="lazy" />` : ''}
    <div class="slide-content">
      ${slide.title ? `<h2 class="slide-title">${slide.title}</h2>` : ''}
      ${slide.desc  ? `<p  class="slide-desc">${slide.desc}</p>`   : ''}
    </div>
  </div>`;

function initSlider(containerId, userConfig = {}) {

    const DEFAULTS = {
        slides:         [],
        duration:       400,
        autoplay:       false,
        autoplayDelay:  3000,
        showArrows:     true,
        showDots:       true,
        showPagination: true,
        startIndex:     0,
    };

    const config = mergeConfig(userConfig, DEFAULTS);

    if (config.slides.length === 0) {
        console.warn(`initSlider: slides array is empty for #${containerId}`);
        return;
    }

    let state = {
        current:      config.startIndex,
        total:        config.slides.length,
        autoplayTimer: null,
        isAnimating:  false,
    };

    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`initSlider: container #${containerId} not found`);
        return;
    }

    container.innerHTML = `
    <div class="slider-viewport">
      <div class="slider-track" id="${containerId}-track">
        ${config.slides.map(buildSlideHTML).join('')}
      </div>
    </div>
    ${config.showArrows ? `
      <button class="slider-arrow prev" id="${containerId}-prev" aria-label="Попередній">&#8249;</button>
      <button class="slider-arrow next" id="${containerId}-next" aria-label="Наступний">&#8250;</button>
    ` : ''}
    ${config.showDots ? `
      <div class="slider-dots" id="${containerId}-dots">
        ${config.slides.map((_, i) => `
          <button class="slider-dot ${i === state.current ? 'active' : ''}"
                  aria-label="Слайд ${i+1}"
                  data-index="${i}">
          </button>`).join('')}
      </div>
    ` : ''}
    ${config.showPagination ? `
      <div class="slider-pagination" id="${containerId}-pagination">
        ${state.current + 1} / ${state.total}
      </div>
    ` : ''}`;

    const track      = document.getElementById(`${containerId}-track`);
    const dotsEl     = document.getElementById(`${containerId}-dots`);
    const pagination = document.getElementById(`${containerId}-pagination`);
    const btnPrev    = document.getElementById(`${containerId}-prev`);
    const btnNext    = document.getElementById(`${containerId}-next`);


    track.style.transition = `transform ${config.duration}ms cubic-bezier(.4,0,.2,1)`;

    function renderSlider() {
        track.style.transform = `translateX(-${state.current * 100}%)`;

        if (dotsEl) {
            dotsEl.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === state.current);
            });
        }

        if (pagination) {
            pagination.textContent = `${state.current + 1} / ${state.total}`;
        }
    }

    function goTo(index) {
        if (state.isAnimating) return;
        if (index === state.current) return;

        state = { ...state, current: index, isAnimating: true };
        renderSlider();

        setTimeout(() => {
            state = { ...state, isAnimating: false };
        }, config.duration);
    }

    const goNext = () => goTo(nextIndex(state.current, state.total,  1));
    const goPrev = () => goTo(nextIndex(state.current, state.total, -1));


    function startAutoplay() {
        if (!config.autoplay) return;
        stopAutoplay(); // скидаємо попередній якщо є
        const timer = setInterval(goNext, config.autoplayDelay);
        state = { ...state, autoplayTimer: timer };
    }

    function stopAutoplay() {
        if (state.autoplayTimer) {
            clearInterval(state.autoplayTimer);
            state = { ...state, autoplayTimer: null };
        }
    }


    if (btnPrev) btnPrev.addEventListener('click', goPrev);
    if (btnNext) btnNext.addEventListener('click', goNext);

    if (dotsEl) {
        dotsEl.addEventListener('click', e => {
            const dot = e.target.closest('.slider-dot');
            if (!dot) return;
            goTo(parseInt(dot.dataset.index));
        });
    }

    let isVisible = false;
    const observer = new IntersectionObserver(
            entries => { isVisible = entries[0].isIntersecting; },
            { threshold: 0.5 }
    );
    observer.observe(container);

    document.addEventListener('keydown', e => {
        if (!isVisible) return;
        if (e.key === 'ArrowLeft')  { goPrev(); resetAutoplay(); }
        if (e.key === 'ArrowRight') { goNext(); resetAutoplay(); }
    });

    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);

    let touchStartX = 0;

    container.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) < 50) return; // ігноруємо короткі свайпи
        if (diff > 0) goNext(); else goPrev();
        resetAutoplay();
    }, { passive: true });

    const resetAutoplay = () => {
        stopAutoplay();
        startAutoplay();
    };

    renderSlider();
    startAutoplay();

    function destroy() {
        stopAutoplay();
        observer.disconnect();
        container.innerHTML = '';
    }

    return { goTo, goNext, goPrev, destroy };
}


initSlider('slider-1', {
    duration:       500,
    autoplay:       true,
    autoplayDelay:  3000,
    showArrows:     true,
    showDots:       true,
    showPagination: true,
    slides: [
        {
            img:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900',
            title: 'Космос',
            desc:  'Безмежний всесвіт чекає на дослідників',
        },
        {
            img:   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900',
            title: 'Природа',
            desc:  'Краса навколишнього світу',
        },
        {
            img:   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900',
            title: 'Океан',
            desc:  'Глибини приховують безліч таємниць',
        },
        {
            img:   'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=900',
            title: 'Ліс',
            desc:  'Тиша і спокій серед зелені',
        },
        {
            img:   'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=900',
            title: 'Захід сонця',
            desc:  'Золоті відтінки вечірнього неба',
        },
    ],
});

initSlider('slider-2', {
    duration:       300,
    autoplay:       false,
    showArrows:     true,
    showDots:       true,
    showPagination: false,
    slides: [
        {
            img:   'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=900',
            title: 'JavaScript',
            desc:  'Мова веб-розробки №1',
        },
        {
            img:   'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=900',
            title: 'Python',
            desc:  'Простота і потужність',
        },
        {
            img:   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900',
            title: 'Rust',
            desc:  'Швидкість і безпека пам\'яті',
        },
        {
            img:   'https://images.unsplash.com/photo-1607706189992-eae578626c86?w=900',
            title: 'Java',
            desc:  'Write once, run anywhere',
        },
    ],
});