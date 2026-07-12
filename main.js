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

// 3D chip hero scene
function initChip3D(){
  const canvas = document.getElementById('chipCanvas');
  const stage = document.getElementById('chipStage');
  if(!canvas || !stage || typeof THREE === 'undefined') return;

  let renderer;
  try{
    renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  } catch(e){ return; }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, stage.clientWidth / stage.clientHeight, 0.1, 100);
  camera.position.set(0, 2.6, 7.6);
  camera.lookAt(0, 0.5, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);

  scene.add(new THREE.AmbientLight(0x2a3550, 1.6));
  const cyanLight = new THREE.PointLight(0x4fe3d0, 7, 16);
  cyanLight.position.set(-3, 3.2, 4);
  scene.add(cyanLight);
  const copperLight = new THREE.PointLight(0xf0a068, 5, 16);
  copperLight.position.set(3.2, -1.5, 3);
  scene.add(copperLight);

  const chipGroup = new THREE.Group();
  scene.add(chipGroup);

  // Procedural circuit texture for the PCB surface
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 512; texCanvas.height = 512;
  const tctx = texCanvas.getContext('2d');
  tctx.fillStyle = '#0d1420';
  tctx.fillRect(0, 0, 512, 512);
  tctx.strokeStyle = 'rgba(79,227,208,0.55)';
  tctx.lineWidth = 2;
  for(let i = 0; i < 46; i++){
    let x = Math.random() * 512, y = Math.random() * 512;
    tctx.beginPath();
    tctx.moveTo(x, y);
    for(let j = 0; j < 4; j++){
      x += (Math.random() - 0.5) * 130;
      y += (Math.random() - 0.5) * 130;
      tctx.lineTo(x, y);
    }
    tctx.stroke();
  }
  tctx.fillStyle = 'rgba(240,160,104,0.75)';
  for(let i = 0; i < 70; i++){
    tctx.beginPath();
    tctx.arc(Math.random() * 512, Math.random() * 512, 2.6, 0, Math.PI * 2);
    tctx.fill();
  }
  const pcbTexture = new THREE.CanvasTexture(texCanvas);

  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(5.2, 0.18, 5.2),
    new THREE.MeshStandardMaterial({
      map: pcbTexture, emissiveMap: pcbTexture, emissive: new THREE.Color(0x1a5a52),
      emissiveIntensity: 0.85, metalness: 0.35, roughness: 0.6
    })
  );
  chipGroup.add(pcb);

  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.5, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x12141c, metalness: 0.55, roughness: 0.3 })
  );
  chip.position.y = 0.34;
  chipGroup.add(chip);

  const notch = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 24),
    new THREE.MeshBasicMaterial({ color: 0x4fe3d0 })
  );
  notch.rotation.x = -Math.PI / 2;
  notch.position.set(-0.85, 0.6, -0.85);
  chipGroup.add(notch);

  const pinMat = new THREE.MeshStandardMaterial({ color: 0xd9a267, metalness: 0.9, roughness: 0.3 });
  const pinGeo = new THREE.BoxGeometry(0.5, 0.08, 0.14);
  const pinCount = 7;
  for(let side = 0; side < 4; side++){
    for(let i = 0; i < pinCount; i++){
      const pin = new THREE.Mesh(pinGeo, pinMat);
      const offset = (i - (pinCount - 1) / 2) * 0.3;
      const dist = 1.35;
      if(side === 0) pin.position.set(offset, 0.1, -dist);
      if(side === 1) pin.position.set(offset, 0.1, dist);
      if(side === 2){ pin.rotation.y = Math.PI / 2; pin.position.set(-dist, 0.1, offset); }
      if(side === 3){ pin.rotation.y = Math.PI / 2; pin.position.set(dist, 0.1, offset); }
      chipGroup.add(pin);
    }
  }

  // Ambient data particles drifting above the board
  const particleCount = 110;
  const positions = new Float32Array(particleCount * 3);
  for(let i = 0; i < particleCount; i++){
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = Math.random() * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
    color: 0x4fe3d0, size: 0.035, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending
  }));
  scene.add(particles);

  const baseTiltX = 0.5;
  let autoY = 0, tiltX = 0, tiltY = 0, mouseX = 0, mouseY = 0;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) - 0.5;
    mouseY = ((e.clientY - rect.top) / rect.height) - 0.5;
  });
  stage.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });

  function onResize(){
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  function animate(){
    requestAnimationFrame(animate);
    if(!prefersReduced){
      autoY += 0.004;
      particles.rotation.y += 0.0006;
    }
    tiltX += (mouseY * 0.35 - tiltX) * 0.05;
    tiltY += (mouseX * 0.5 - tiltY) * 0.05;
    chipGroup.rotation.set(baseTiltX + tiltX, autoY + tiltY, 0);
    renderer.render(scene, camera);
  }
  animate();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initChip3D);
} else {
  initChip3D();
}