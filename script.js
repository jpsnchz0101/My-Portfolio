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
