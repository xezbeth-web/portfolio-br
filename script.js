const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const revealTargets = document.querySelectorAll('.reveal');
const scrollBtn = document.querySelector('.scroll-top');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const heroWord = document.getElementById('hero-word');
const bgSquares = [...document.querySelectorAll('.bg-square')];

const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

if (cursorDot && cursorRing && hasFinePointer) {
  let dotX = window.innerWidth / 2;
  let dotY = window.innerHeight / 2;
  let ringX = dotX;
  let ringY = dotY;

  const placeDot = () => {
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;
  };

  const placeRing = () => {
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
  };

  window.addEventListener('mousemove', event => {
    dotX = event.clientX;
    dotY = event.clientY;
    placeDot();
  });

  const animateRing = () => {
    ringX += (dotX - ringX) * 0.22;
    ringY += (dotY - ringY) * 0.22;
    placeRing();
    requestAnimationFrame(animateRing);
  };

  placeDot();
  placeRing();
  animateRing();

  const interactiveElements = document.querySelectorAll('a, button, .project-showcase');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      if (element.classList.contains('project-showcase')) {
        document.body.classList.add('cursor-project');
      }
    });

    element.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
      document.body.classList.remove('cursor-project');
    });
  });

  window.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-hover');
    document.body.classList.remove('cursor-project');
  });
}

if (bgSquares.length > 0) {
  let parallaxQueued = false;

  const updateSquares = () => {
    const scrollY = window.scrollY || 0;

    bgSquares.forEach((square, index) => {
      const speed = Number(square.dataset.speed || 0.08);
      const driftY = scrollY * speed;
      const swayX = Math.sin(scrollY / 220 + index * 1.1) * 14;
      const baseTransform = square.dataset.base || '';
      square.style.transform = `translate3d(${swayX.toFixed(2)}px, ${driftY.toFixed(2)}px, 0) ${baseTransform}`;
    });

    parallaxQueued = false;
  };

  const queueSquareUpdate = () => {
    if (parallaxQueued) return;
    parallaxQueued = true;
    requestAnimationFrame(updateSquares);
  };

  window.addEventListener('scroll', queueSquareUpdate, { passive: true });
  window.addEventListener('resize', queueSquareUpdate);
  updateSquares();
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => nav.classList.toggle('open'));
}

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (nav) nav.classList.remove('open');
  });
});

if ('IntersectionObserver' in window) {
  // rootMargin creates a detection band: top 20%–45% of viewport.
  // Whichever section enters that band becomes active — far more accurate
  // than threshold-only detection.
  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-18% 0px -78% 0px', threshold: 0 }
  );

  sections.forEach(section => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach(node => revealObserver.observe(node));
} else {
  revealTargets.forEach(node => node.classList.add('visible'));
}

if (scrollBtn) {
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 320);
  });

  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

if (heroWord) {
  const words = (heroWord.dataset.words || '')
    .split(',')
    .map(word => word.trim())
    .filter(Boolean);

  if (words.length > 0) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let wordIndex = 0;
    heroWord.textContent = words[wordIndex];
    heroWord.dataset.text = words[wordIndex];

    const cycleWord = () => {
      wordIndex = (wordIndex + 1) % words.length;
      const nextWord = words[wordIndex];
      heroWord.textContent = nextWord;
      heroWord.dataset.text = nextWord;

      if (!reducedMotion) {
        heroWord.classList.remove('glitch');
        // Force reflow so repeated class adds retrigger animation.
        void heroWord.offsetWidth;
        heroWord.classList.add('glitch');
      }

      const delay = reducedMotion ? 2400 : 1250 + Math.floor(Math.random() * 650);
      setTimeout(cycleWord, delay);
    };

    setTimeout(cycleWord, reducedMotion ? 1800 : 1200);
  }
}

// 3-D tilt — whole card (text + image together)
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.project-showcase').forEach(card => {
    const tilt = card.querySelector('.project-card-tilt');
    if (!tilt) return;

    card.addEventListener('mouseenter', () => {
      tilt.style.transition = 'transform 0.14s ease, box-shadow 0.18s ease';
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const xRel = (e.clientX - rect.left)  / rect.width  - 0.5;  // -0.5 … 0.5
      const yRel = (e.clientY - rect.top)   / rect.height - 0.5;
      const rotY =  xRel * 16;   // ±8 deg left/right
      const rotX = -yRel * 10;   // ±5 deg up/down
      tilt.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      tilt.style.transition = 'transform 0.65s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s ease';
      tilt.style.transform = '';
    });
  });
}

// Project description overlay — click card to reveal, click again or outside to dismiss
document.querySelectorAll('.project-showcase').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.closest('.project-ext-link')) return; // let links navigate normally
    const isOpen = card.classList.contains('is-open');
    // close all first
    document.querySelectorAll('.project-showcase.is-open').forEach(c => c.classList.remove('is-open'));
    if (!isOpen) card.classList.add('is-open');
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('.project-showcase')) {
    document.querySelectorAll('.project-showcase.is-open').forEach(c => c.classList.remove('is-open'));
  }
});
