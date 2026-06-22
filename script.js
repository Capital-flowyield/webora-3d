const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

initHeaderState();
initRevealAnimations();
initTiltCards();
initParticleCanvas();
initHeroScrollFade();
loadFlowerScene();

function initHeaderState() {
  const headers = document.querySelectorAll('.site-header, .case-header');
  if (!headers.length) return;

  const update = () => {
    headers.forEach((header) => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    });
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initRevealAnimations() {
  const revealItems = document.querySelectorAll('.reveal');
  if (!revealItems.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -8% 0px',
  });

  revealItems.forEach((item) => observer.observe(item));
}

function initTiltCards() {
  if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const tiltItems = document.querySelectorAll('[data-tilt]');
  tiltItems.forEach((item) => {
    let frame = null;

    const move = (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 9;
      const rotateX = (0.5 - y) * 9;

      item.style.setProperty('--mx', `${x * 100}%`);
      item.style.setProperty('--my', `${y * 100}%`);

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        item.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });
    };

    const leave = () => {
      cancelAnimationFrame(frame);
      item.style.transform = '';
      item.style.setProperty('--mx', '50%');
      item.style.setProperty('--my', '0%');
    };

    item.addEventListener('pointermove', move);
    item.addEventListener('pointerleave', leave);
  });
}

function initHeroScrollFade() {
  const hero = document.querySelector('.hero__content');
  const visual = document.querySelector('.hero__visual');
  if (!hero || !visual || prefersReducedMotion) return;

  let ticking = false;
  const update = () => {
    const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.75));
    hero.style.transform = `translateY(${progress * 36}px)`;
    visual.style.transform = `translateY(${progress * -18}px)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  update();
}

function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let pointerX = 0;
  let pointerY = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles.length = 0;
    const count = Math.min(96, Math.max(34, Math.floor((width * height) / 18000)));
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 1.8 + 0.55,
        alpha: Math.random() * 0.45 + 0.16,
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (const particle of particles) {
      particle.x += particle.vx + pointerX * 0.012;
      particle.y += particle.vy + pointerY * 0.012;

      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;

      const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 7);
      gradient.addColorStop(0, `rgba(103, 232, 249, ${particle.alpha})`);
      gradient.addColorStop(0.55, `rgba(167, 139, 250, ${particle.alpha * 0.36})`);
      gradient.addColorStop(1, 'rgba(103, 232, 249, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 7, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  window.addEventListener('pointermove', (event) => {
    pointerX = (event.clientX / Math.max(width, 1)) - 0.5;
    pointerY = (event.clientY / Math.max(height, 1)) - 0.5;
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  animate();
}

async function loadFlowerScene() {
  const canvas = document.getElementById('webora-flower-scene');
  if (!canvas) return;

  try {
    const THREE = await import(THREE_CDN);
    initFlowerScene(THREE, canvas);
  } catch (error) {
    console.warn('Three.js non disponibile: resta visibile il fiore CSS fallback.', error);
  }
}

function initFlowerScene(THREE, canvas) {
  const shell = canvas.closest('.webora-scene-shell');
  const fallback = shell?.querySelector('.flower-fallback');
  if (fallback) fallback.style.opacity = '0';

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.25, 6.1);

  const flower = new THREE.Group();
  const flowerHead = new THREE.Group();
  flower.add(flowerHead);
  scene.add(flower);

  const hemi = new THREE.HemisphereLight(0xdffbff, 0x090b18, 2.2);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0x9eefff, 3.2);
  key.position.set(3.5, 4, 5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xf0abfc, 2.4);
  rim.position.set(-4, -2, 3);
  scene.add(rim);

  const petalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x67e8f9,
    emissive: 0x17465e,
    roughness: 0.38,
    metalness: 0.03,
    clearcoat: 0.75,
    clearcoatRoughness: 0.25,
    transmission: 0.08,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });

  const petalMaterialPink = new THREE.MeshPhysicalMaterial({
    color: 0xf0abfc,
    emissive: 0x37164a,
    roughness: 0.42,
    metalness: 0.04,
    clearcoat: 0.6,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
  });

  const petalGeometry = new THREE.SphereGeometry(1, 36, 18);
  const centerGeometry = new THREE.IcosahedronGeometry(0.32, 3);
  const centerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfef08a,
    emissive: 0x6b4200,
    roughness: 0.36,
    metalness: 0.08,
    clearcoat: 0.5,
  });

  createPetalLayer({
    THREE,
    group: flowerHead,
    geometry: petalGeometry,
    material: petalMaterialPink,
    count: 10,
    radius: 0.66,
    scale: [0.28, 0.86, 0.055],
    z: -0.03,
    rotationOffset: 0,
  });

  createPetalLayer({
    THREE,
    group: flowerHead,
    geometry: petalGeometry,
    material: petalMaterial,
    count: 10,
    radius: 0.49,
    scale: [0.22, 0.68, 0.05],
    z: 0.11,
    rotationOffset: Math.PI / 10,
  });

  const center = new THREE.Mesh(centerGeometry, centerMaterial);
  center.position.set(0, 0.55, 0.27);
  center.scale.set(1.08, 1.08, 0.58);
  flowerHead.add(center);

  const stemMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x65d88f,
    emissive: 0x062f1b,
    roughness: 0.48,
    metalness: 0.04,
    clearcoat: 0.4,
  });

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.08, 2.15, 22), stemMaterial);
  stem.position.set(0, -0.72, -0.03);
  stem.rotation.z = -0.08;
  flower.add(stem);

  const leafGeometry = new THREE.SphereGeometry(1, 32, 14);
  const leafLeft = new THREE.Mesh(leafGeometry, stemMaterial);
  leafLeft.scale.set(0.12, 0.45, 0.035);
  leafLeft.position.set(-0.27, -0.65, 0.06);
  leafLeft.rotation.z = 0.96;
  flower.add(leafLeft);

  const leafRight = leafLeft.clone();
  leafRight.position.x = 0.28;
  leafRight.position.y = -0.98;
  leafRight.rotation.z = -0.92;
  flower.add(leafRight);

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  });

  const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.008, 12, 120), ringMaterial);
  ringA.rotation.x = Math.PI * 0.58;
  ringA.rotation.y = Math.PI * 0.08;
  ringA.position.y = 0.17;
  scene.add(ringA);

  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.006, 12, 140), ringMaterial.clone());
  ringB.material.opacity = 0.16;
  ringB.rotation.x = Math.PI * 0.5;
  ringB.rotation.y = -Math.PI * 0.28;
  ringB.position.y = 0.1;
  scene.add(ringB);

  const sparkles = createSparkles(THREE);
  scene.add(sparkles);

  flower.position.set(0, -0.18, 0);
  flower.rotation.x = -0.16;
  flower.rotation.y = 0.16;
  flower.scale.setScalar(1.2);

  const pointer = { x: 0, y: 0 };
  const targetPointer = { x: 0, y: 0 };
  const clock = new THREE.Clock();

  shell?.addEventListener('pointermove', (event) => {
    const rect = shell.getBoundingClientRect();
    targetPointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetPointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  }, { passive: true });

  shell?.addEventListener('pointerleave', () => {
    targetPointer.x = 0;
    targetPointer.y = 0;
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    const scroll = Math.min(1, window.scrollY / Math.max(window.innerHeight * 1.4, 1));

    pointer.x += (targetPointer.x - pointer.x) * 0.06;
    pointer.y += (targetPointer.y - pointer.y) * 0.06;

    flower.rotation.y = 0.2 + pointer.x * 0.33 + scroll * 0.62 + Math.sin(elapsed * 0.55) * 0.045;
    flower.rotation.x = -0.18 - pointer.y * 0.24 + Math.sin(elapsed * 0.7) * 0.035;
    flowerHead.rotation.z = Math.sin(elapsed * 0.72) * 0.045;
    center.rotation.y = elapsed * 0.35;

    ringA.rotation.z = elapsed * 0.18;
    ringB.rotation.z = -elapsed * 0.13;
    sparkles.rotation.y = elapsed * 0.025;
    sparkles.rotation.x = Math.sin(elapsed * 0.2) * 0.06;

    renderer.render(scene, camera);
    if (!prefersReducedMotion) requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  animate();
}

function createPetalLayer({ THREE, group, geometry, material, count, radius, scale, z, rotationOffset }) {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + rotationOffset;
    const petal = new THREE.Mesh(geometry, material.clone());
    const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);

    petal.position.set(direction.x * radius, 0.55 + direction.y * radius, z);
    petal.rotation.z = angle - Math.PI / 2;
    petal.rotation.x = 0.08 * Math.sin(angle);
    petal.scale.set(scale[0], scale[1], scale[2]);
    petal.material.opacity = material.opacity * (0.86 + Math.random() * 0.14);
    group.add(petal);
  }
}

function createSparkles(THREE) {
  const count = 130;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorA = new THREE.Color(0x67e8f9);
  const colorB = new THREE.Color(0xf0abfc);

  for (let i = 0; i < count; i += 1) {
    const radius = 1.25 + Math.random() * 2.35;
    const angle = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 2.65;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.58;

    const mixed = colorA.clone().lerp(colorB, Math.random());
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.026,
    transparent: true,
    opacity: 0.82,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}
