// ===== CONFIGURATION =====
// 🔧 CHANGE THIS to your deployed Render backend URL later!
const BACKEND_URL = "https://portfolio-backend-3ovz.onrender.com";

// ===== MATRIX RAIN =====
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  let cols, drops;

  function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / 20);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(5,10,14,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font = '14px Share Tech Mono';
    const chars = '01アイウエオカキクケコサシスセソタチツテトABCDEF<>/{}[]';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 20, y * 20);
      if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  setup();
  setInterval(draw, 50);
  window.addEventListener('resize', setup);
})();

// ===== TYPING EFFECT =====
(function initTyping() {
  const roles = [
    'BCA Student & Web Developer',
    'Full-Stack Developer',
    'Cybersecurity Enthusiast',
    'Open Source Contributor',
    'Problem Solver'
  ];
  let rIdx = 0, cIdx = 0, deleting = false;
  const el = document.getElementById('typing');

  function type() {
    const current = roles[rIdx];
    el.textContent = deleting
      ? current.substring(0, cIdx--)
      : current.substring(0, cIdx++);

    if (!deleting && cIdx === current.length + 1) {
      setTimeout(() => { deleting = true; }, 2000);
    } else if (deleting && cIdx === 0) {
      deleting = false;
      rIdx = (rIdx + 1) % roles.length;
    }
    setTimeout(type, deleting ? 50 : 100);
  }
  type();
})();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  let count = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = count;
    if (count >= target) clearInterval(interval);
  }, 50);
}

// ===== SKILL BARS ANIMATION =====
function animateBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    bar.style.width = bar.dataset.width + '%';
  });
}

// ===== SCROLL REVEAL =====
function initReveal() {
  const revealEls = document.querySelectorAll(
    '.project-card, .skill-category, .workflow-step, .about-card, .contact-info, .contact-form-wrap'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Trigger counters
        if (entry.target.closest('#hero') || entry.target.id === 'hero') {
          document.querySelectorAll('.stat-num').forEach(animateCounter);
        }
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));

  // Counters & bars separate observer
  const skillsSection = document.getElementById('skills');
  const heroSection = document.getElementById('hero');

  new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) animateBars(); });
  }, { threshold: 0.3 }).observe(skillsSection);

  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) document.querySelectorAll('.stat-num').forEach(animateCounter);
    });
  }, { threshold: 0.5 }).observe(heroSection);
}

initReveal();

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 200) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
  });
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');

  const name = document.getElementById('nameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  const message = document.getElementById('messageInput').value.trim();

  if (!name || !email || !message) {
    showStatus('error', '[ ERROR ] All fields are required.');
    return;
  }

  btn.textContent = '[ TRANSMITTING... ]';
  btn.disabled = true;

  try {
    const res = await fetch(`${BACKEND_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();

    if (res.ok) {
      showStatus('success', '[ SUCCESS ] Message transmitted successfully! I\'ll get back to you soon.');
      this.reset();
    } else {
      showStatus('error', `[ ERROR ] ${data.message || 'Something went wrong.'}`);
    }
  } catch (err) {
    showStatus('error', '[ ERROR ] Could not connect to server. Please try again later.');
    console.error(err);
  } finally {
    btn.textContent = '[ TRANSMIT MESSAGE ]';
    btn.disabled = false;
  }
});

function showStatus(type, msg) {
  const el = document.getElementById('formStatus');
  el.className = `form-status ${type}`;
  el.textContent = msg;
  setTimeout(() => { el.style.display = 'none'; }, 6000);
}

// ===== EASTER EGG =====
const keys = [];
const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
document.addEventListener('keydown', e => {
  keys.push(e.key);
  keys.splice(-code.length - 1, keys.length - code.length);
  if (keys.join(',') === code.join(',')) {
    document.body.style.filter = 'hue-rotate(180deg)';
    setTimeout(() => document.body.style.filter = '', 3000);
    console.log('%c[ KONAMI CODE ACTIVATED ] 🎮', 'color:#00ff88; font-size:1.2rem;');
  }
});

console.log('%c> PORTFOLIO LOADED', 'color:#00ff88; font-family:monospace; font-size:1rem;');
console.log('%c> Stack: HTML + CSS + JS + Node.js + PostgreSQL', 'color:#00ccff; font-family:monospace;');
