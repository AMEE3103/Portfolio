// Typing effect
const roles = ["CSE student at IHRD Attingal", "Python developer", "web developer", "building digital experiences"];
const typedEl = document.getElementById('typed');
let ri = 0, ci = 0, deleting = false;
function tick(){
  const word = roles[ri];
  if(!deleting){
    ci++;
    typedEl.textContent = word.slice(0, ci);
    if(ci === word.length){ deleting = true; setTimeout(tick, 1400); return; }
  } else {
    ci--;
    typedEl.textContent = word.slice(0, ci);
    if(ci === 0){ deleting = false; ri = (ri+1) % roles.length; }
  }
  setTimeout(tick, deleting ? 45 : 90);
}
tick();

// Scroll reveal + skill bar fill
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      e.target.querySelectorAll('.bar-fill').forEach(b=>{
        b.style.width = b.dataset.width + '%';
      });
    }
  });
}, {threshold:0.2});
revealEls.forEach(el=>io.observe(el));

// Nav active state + circuit trace fill
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navlinks a');
function onScroll(){
  let current = '';
  sections.forEach(sec=>{
    const rect = sec.getBoundingClientRect();
    if(rect.top <= 140 && rect.bottom >= 140){ current = sec.id; }
  });
  navLinks.forEach(a=>{
    a.classList.toggle('active', a.dataset.nav === current);
  });
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  const trace = document.getElementById('traceLine');
  if(trace){ trace.setAttribute('y2', (progress * 800).toFixed(0)); }
}
document.addEventListener('scroll', onScroll, {passive:true});
onScroll();

