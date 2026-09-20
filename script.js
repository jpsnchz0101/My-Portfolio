/**
 * ==============================================================================
 * SCRIPT.JS — John Paulo Sanchez Portfolio
 * Plain JavaScript: Beginner-readable, modular, and single-purpose functions.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive components
  initSmoothScroll();
  initMobileNav();
  initScrollReveal();
  initActiveNavHighlight();
  initCopyEmail();
  initMessageForm();
  initVideoReels();
  initMediaLightbox();
  initInteractiveCanvas();
});

/**
 * ------------------------------------------------------------------------------
 * 1. SMOOTH SCROLLING
 * Ensures all internal anchor links (#about, #experience, etc.) scroll smoothly
 * with appropriate spacing from the top.
 * ------------------------------------------------------------------------------
 */
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      
      // Ignore bare '#' links
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        event.preventDefault();

        // Scroll smoothly to target element
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // Update the browser URL without jumping
        if (history.pushState) {
          history.pushState(null, '', targetId);
        }
      }
    });
  });
}

/**
 * ------------------------------------------------------------------------------
 * 2. MOBILE NAVIGATION TOGGLE
 * Toggles the navigation links dropdown on smaller screens and closes it
 * automatically when a link is clicked.
 * ------------------------------------------------------------------------------
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('navToggleBtn');
  const navLinksList = document.getElementById('navLinksList');

  if (!toggleBtn || !navLinksList) return;

  // Toggle dropdown on button click
  toggleBtn.addEventListener('click', () => {
    const isOpen = navLinksList.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    toggleBtn.textContent = isOpen ? '[ close ]' : '[ menu ]';
  });

  // Automatically close dropdown when any navigation link is clicked
  const links = navLinksList.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      navLinksList.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.textContent = '[ menu ]';
    });
  });

  // Close dropdown if clicked outside
  document.addEventListener('click', (event) => {
    if (!toggleBtn.contains(event.target) && !navLinksList.contains(event.target)) {
      navLinksList.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.textContent = '[ menu ]';
    }
  });
}

/**
 * ------------------------------------------------------------------------------
 * 3. SCROLL REVEAL EFFECT
 * Uses the native browser IntersectionObserver API to gently fade and slide up
 * sections and cards as they enter the viewport.
 * ------------------------------------------------------------------------------
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers: show all elements immediately
    revealElements.forEach((el) => el.classList.add('active'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px', // Triggers slightly before element reaches bottom
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, unobserve to optimize performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

/**
 * ------------------------------------------------------------------------------
 * 4. ACTIVE NAVIGATION LINK HIGHLIGHT ON SCROLL
 * Highlights the active section link in the navbar as the visitor scrolls down.
 * ------------------------------------------------------------------------------
 */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/**
 * ------------------------------------------------------------------------------
 * 5. COPY EMAIL TO CLIPBOARD
 * Allows the viewer to quickly copy John Paulo's email with a single click.
 * ------------------------------------------------------------------------------
 */
function initCopyEmail() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const emailLink = document.getElementById('contactEmailLink');

  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    const emailToCopy = emailLink ? emailLink.textContent.trim() : 'johnpaulosnchz@gmail.com';

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(emailToCopy);
      } else {
        // Fallback for insecure / restricted iframe contexts
        const tempInput = document.createElement('textarea');
        tempInput.value = emailToCopy;
        tempInput.style.position = 'fixed';
        tempInput.style.left = '-9999px';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      // Visual feedback
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span>✓ Copied!</span>';
      copyBtn.style.color = '#10b981';
      copyBtn.style.borderColor = '#10b981';

      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.color = '';
        copyBtn.style.borderColor = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  });
}

/**
 * ------------------------------------------------------------------------------
 * 6. MESSAGE SENDER FORM
 * Validates inputs, provides instant visual feedback, and triggers a formatted
 * mailto message so the message is actually sent directly to John Paulo Sanchez.
 * ------------------------------------------------------------------------------
 */
function initMessageForm() {
  const form = document.getElementById('contactForm');
  const statusMsg = document.getElementById('formStatusMsg');

  if (!form || !statusMsg) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = document.getElementById('senderName');
    const emailInput = document.getElementById('senderEmail');
    const subjectInput = document.getElementById('senderSubject');
    const messageInput = document.getElementById('senderMessage');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim() || 'Portfolio Inquiry';
    const message = messageInput.value.trim();

    // Basic Validation
    if (!name || !email || !message) {
      statusMsg.className = 'form-status-msg error';
      statusMsg.textContent = 'Please complete all required fields before sending.';
      return;
    }

    // Success feedback
    statusMsg.className = 'form-status-msg success';
    statusMsg.textContent = `Thank you, ${name}! Preparing your message... Opening your default email client.`;

    // Construct mailto link
    const mailtoRecipient = 'johnpaulosnchz@gmail.com';
    const encodedSubject = encodeURIComponent(`[Portfolio] ${subject} - from ${name}`);
    const encodedBody = encodeURIComponent(
      `Hi John Paulo,\n\n${message}\n\n---\nSender: ${name}\nEmail: ${email}`
    );

    const mailtoUrl = `mailto:${mailtoRecipient}?subject=${encodedSubject}&body=${encodedBody}`;

    // Trigger mail client
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 600);

    // Reset form after short delay
    setTimeout(() => {
      form.reset();
      setTimeout(() => {
        statusMsg.style.display = 'none';
        statusMsg.className = 'form-status-msg';
      }, 5000);
    }, 2000);
  });
}

/**
 * ------------------------------------------------------------------------------
 * 7. 9:16 VIDEO REELS INTERACTION
 * Handles play/pause toggle, mute/unmute audio control, and focus for 9:16 reels.
 * ------------------------------------------------------------------------------
 */
function initVideoReels() {
  const reelCards = document.querySelectorAll('.video-reel-card');

  reelCards.forEach((card) => {
    const video = card.querySelector('.reel-video-element');
    const soundBtn = card.querySelector('.video-sound-btn');

    if (!video) return;

    // Toggle play/pause on card click
    const togglePlayback = (e) => {
      // Don't trigger if clicked on sound button
      if (e.target.closest('.video-sound-btn')) return;

      if (video.paused) {
        // Pause all other videos first to maintain single-focus
        document.querySelectorAll('.reel-video-element').forEach((v) => {
          if (v !== video && !v.paused) {
            v.pause();
            const parentCard = v.closest('.video-reel-card');
            if (parentCard) parentCard.classList.remove('is-playing');
          }
        });

        video.play().then(() => {
          card.classList.add('is-playing');
        }).catch((err) => {
          // If autoplay with audio was blocked or src not yet loaded, toggle visually
          console.warn('Video playback notice:', err);
          card.classList.toggle('is-playing');
        });
      } else {
        video.pause();
        card.classList.remove('is-playing');
      }
    };

    card.addEventListener('click', togglePlayback);

    // Keyboard accessibility: Enter or Space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePlayback(e);
      }
    });

    // Sound toggle
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent card click
        video.muted = !video.muted;

        if (video.muted) {
          // Show muted icon
          soundBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          `;
          soundBtn.setAttribute('title', 'Unmute audio');
        } else {
          // Show unmuted icon
          soundBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          `;
          soundBtn.setAttribute('title', 'Mute audio');
        }
      });
    }

    // Update class if video ends
    video.addEventListener('ended', () => {
      card.classList.remove('is-playing');
    });
  });
}

/**
 * ------------------------------------------------------------------------------
 * 8. MEDIA GRAPHICS LIGHTBOX MODAL
 * Opens high-resolution view of graphics or reels when clicked.
 * ------------------------------------------------------------------------------
 */
function initMediaLightbox() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const modalTitle = document.getElementById('lightboxTitle');
  const modalDesc = document.getElementById('lightboxDesc');
  const modalTags = document.getElementById('lightboxTags');
  const mediaContainer = document.getElementById('lightboxMediaContainer');

  if (!modal || !closeBtn) return;

  function openLightbox(title, desc, tagsString, mediaSrc) {
    modalTitle.textContent = title || 'Media Asset Preview';
    modalDesc.textContent = desc || '';
    
    // Clear and populate tags
    modalTags.innerHTML = '';
    if (tagsString) {
      const tags = tagsString.split(',');
      tags.forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.textContent = tag.trim();
        modalTags.appendChild(span);
      });
    }

    // Inject media element
    mediaContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = mediaSrc;
    img.alt = title || 'Full Media Preview';
    img.className = 'lightbox-media-img';
    mediaContainer.appendChild(img);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    mediaContainer.innerHTML = '';
  }

  // Attach click to all graphic cards
  const graphicCards = document.querySelectorAll('.media-graphic-card');
  graphicCards.forEach((card) => {
    const frame = card.querySelector('.media-graphic-thumb-frame');
    const inspectBtn = card.querySelector('.media-inspect-btn');

    const triggerOpen = () => {
      if (!frame) return;
      const title = frame.getAttribute('data-title');
      const desc = frame.getAttribute('data-desc');
      const tags = frame.getAttribute('data-tags');
      const src = frame.getAttribute('data-src');
      openLightbox(title, desc, tags, src);
    };

    if (frame) frame.addEventListener('click', triggerOpen);
    if (inspectBtn) inspectBtn.addEventListener('click', triggerOpen);
  });

  // Close handlers
  closeBtn.addEventListener('click', closeLightbox);

  modal.addEventListener('click', (e) => {
    // If clicked on the backdrop (outside dialog), close modal
    if (e.target === modal) {
      closeLightbox();
    }
  });

  // ESC key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

/**
 * ------------------------------------------------------------------------------
 * 9. INTERACTIVE BACKGROUND CANVAS FOR SIDE MARGINS
 * Generates dynamic, interactive visual particles in the left and right empty
 * spaces. Responds to mouse motion, clicks, and mode switches.
 * ------------------------------------------------------------------------------
 */
let currentCanvasMode = 'constellation';
let canvasRipples = [];
let rippleCount = 0;

function initInteractiveCanvas() {
  const canvas = document.getElementById('sideInteractiveCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  // Track mouse coordinates
  const mouse = { x: -1000, y: -1000, active: false };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  // Particle pool
  const particles = [];
  const PARTICLE_COUNT = 75;

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.8 + 1,
        baseAlpha: Math.random() * 0.32 + 0.15,
        char: String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96)),
        charTimer: 0,
      });
    }
  }

  initParticles();

  // Click trigger for ripple animation
  function addRipple(x, y) {
    canvasRipples.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: Math.min(width, height) * 0.25 + 40,
      alpha: 0.8,
      speed: 3.5,
    });
    rippleCount++;
  }

  window.addEventListener('click', (e) => {
    // Spawn ripple if clicked on background canvas (not clicking buttons/inputs/links)
    if (!e.target.closest('button, a, input, textarea')) {
      addRipple(e.clientX, e.clientY);
    }
  });

  const rippleBtn = document.getElementById('fxRippleTrigger');
  if (rippleBtn) {
    rippleBtn.addEventListener('click', () => {
      const leftX = Math.max(60, (width - 760) / 4);
      const rightX = width - leftX;
      addRipple(leftX, 220);
      addRipple(rightX, 260);
    });
  }

  // Animation Loop (60 FPS)
  function render() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw and update ripples
    for (let i = canvasRipples.length - 1; i >= 0; i--) {
      const r = canvasRipples[i];
      r.radius += r.speed;
      r.alpha -= 0.015;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        canvasRipples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(16, 185, 129, ${r.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Secondary ring
      if (r.radius > 20) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Render particles according to selected mode
    if (currentCanvasMode === 'constellation') {
      // Draw nodes and connecting lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction: slower, smoother attraction across the entire canvas (center included)
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;

          if (dist < maxDist && dist > 1) {
            // Attract slower with organic ease-off
            const force = (1 - dist / maxDist) * 0.0035;
            p.x += dx * force;
            p.y += dy * force;

            // Draw line to mouse
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.32 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${p.baseAlpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - dist / 85)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    } else if (currentCanvasMode === 'matrix') {
      // Digital glyph cascade in the side margins
      ctx.font = '11px monospace';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += 1.2;
        if (p.y > height) p.y = 0;

        p.charTimer++;
        if (p.charTimer > 15) {
          p.char = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
          p.charTimer = 0;
        }

        ctx.fillStyle = `rgba(16, 185, 129, ${p.baseAlpha * 1.2})`;
        ctx.fillText(p.char, p.x, p.y);
      }
    } else if (currentCanvasMode === 'sparks') {
      // Floating glowing embers
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= 0.6;
        p.x += Math.sin(p.y * 0.02) * 0.4;
        if (p.y < 0) p.y = height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.baseAlpha * 1.4})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

