const texts = [
  'Python Developer',
  'AI Enthusiast',
  'Web Developer'
];

const typingEl = document.getElementById('typing-text');
let textIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typingEl) return;
  const current = texts[textIndex];
  typingEl.textContent = current.slice(0, charIndex);

  if (!deleting && charIndex < current.length) {
    charIndex++;
    setTimeout(typeLoop, 80);
  } else if (deleting && charIndex > 0) {
    charIndex--;
    setTimeout(typeLoop, 50);
  } else {
    deleting = !deleting;
    if (!deleting) {
      textIndex = (textIndex + 1) % texts.length;
    }
    setTimeout(typeLoop, 900);
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

typeLoop();
