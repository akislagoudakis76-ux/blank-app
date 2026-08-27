/* ============================================================
   AETHER MARINE — Hero 3D scene
   An animated shiny ocean with champagne + sea specular light.
   Minimal, calm, luxury. Degrades gracefully.
   ============================================================ */
(function () {
  "use strict";

  const canvas = document.getElementById("scene");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Graceful fallback — painterly gradient if 3D unavailable / not wanted.
  function fallback() {
    canvas.style.background =
      "radial-gradient(120% 90% at 75% 12%, #12496b 0%, #0a2233 45%, #05141f 100%)";
  }

  if (reduced || typeof window.THREE === "undefined") {
    fallback();
    return;
  }

  const THREE = window.THREE;
  let renderer, scene, camera, ocean, motes, raf, running = true;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: "high-performance",
    });
  } catch (e) {
    fallback();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x05141f, 1);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05141f, 0.055);

  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
  camera.position.set(0, 5.2, 15);
  camera.lookAt(0, 0.5, 0);

  // ---- Lighting: two signature speculars (champagne gold + sea cyan) ----
  scene.add(new THREE.AmbientLight(0x2b6486, 0.55));

  const gold = new THREE.DirectionalLight(0xf2dca4, 1.5);
  gold.position.set(-8, 9, 6);
  scene.add(gold);

  const sea = new THREE.PointLight(0x35c6ff, 1.4, 60, 1.6);
  sea.position.set(9, 6, -4);
  scene.add(sea);

  const rim = new THREE.PointLight(0xd8b26a, 0.9, 40, 2);
  rim.position.set(0, 3, 12);
  scene.add(rim);

  // ---- The ocean: displaced plane with a glossy metallic surface ----
  const SEG = 96, SIZE = 60;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);

  const mat = new THREE.MeshStandardMaterial({
    color: 0x0c3b57,
    metalness: 0.9,
    roughness: 0.28,
    flatShading: false,
  });

  ocean = new THREE.Mesh(geo, mat);
  ocean.position.y = -1.2;
  scene.add(ocean);

  // cache base positions for wave math
  const pos = geo.attributes.position;
  const base = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    base[i * 2] = pos.getX(i);
    base[i * 2 + 1] = pos.getZ(i);
  }

  function wave(x, z, t) {
    return (
      Math.sin(x * 0.35 + t * 0.9) * 0.55 +
      Math.sin(z * 0.5 + t * 1.15) * 0.4 +
      Math.sin((x + z) * 0.22 + t * 0.6) * 0.5 +
      Math.cos(x * 0.15 - z * 0.2 + t * 0.4) * 0.35
    );
  }

  // ---- Light motes drifting above the water ----
  const moteCount = 90;
  const mg = new THREE.BufferGeometry();
  const mp = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    mp[i * 3] = (Math.random() - 0.5) * 46;
    mp[i * 3 + 1] = Math.random() * 10 + 0.5;
    mp[i * 3 + 2] = (Math.random() - 0.5) * 40 - 4;
  }
  mg.setAttribute("position", new THREE.BufferAttribute(mp, 3));
  const mmat = new THREE.PointsMaterial({
    color: 0xf2dca4, size: 0.09, transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  motes = new THREE.Points(mg, mmat);
  scene.add(motes);

  // ---- Resize ----
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ---- Pointer parallax ----
  window.addEventListener("pointermove", function (e) {
    pointer.tx = (e.clientX / window.innerWidth - 0.5);
    pointer.ty = (e.clientY / window.innerHeight - 0.5);
  });

  // ---- Pause when tab hidden or hero scrolled away ----
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) loop();
  });

  const clock = new THREE.Clock();

  function loop() {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const t = clock.getElapsedTime();

    // animate ocean
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 2], z = base[i * 2 + 1];
      pos.setY(i, wave(x, z, t));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // drift motes upward, wrap around
    const arr = mg.attributes.position.array;
    for (let i = 0; i < moteCount; i++) {
      arr[i * 3 + 1] += 0.006;
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.002;
      if (arr[i * 3 + 1] > 11) arr[i * 3 + 1] = 0.4;
    }
    mg.attributes.position.needsUpdate = true;

    // easing parallax on camera
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x = pointer.x * 3.2;
    camera.position.y = 5.2 - pointer.y * 1.4;
    camera.lookAt(0, 0.4, 0);

    // slowly wander the sea light for living reflections
    sea.position.x = Math.sin(t * 0.25) * 11;
    sea.position.z = Math.cos(t * 0.2) * 8 - 2;

    renderer.render(scene, camera);
  }

  loop();
})();
