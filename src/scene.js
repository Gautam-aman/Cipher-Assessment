import * as THREE from '../node_modules/three/build/three.module.js';
import { VendingPreview } from './vending.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function createStudioScene(canvas, { onPreviewEvent = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 70);
  camera.position.set(6.2, 4.1, 7.4);
  camera.lookAt(0, 0.05, 0);
  scene.add(new THREE.HemisphereLight(0xa8bdff, 0x111525, 2.15));
  const keyLight = new THREE.DirectionalLight(0xc5b4ff, 3.1);
  keyLight.position.set(-3, 6, 5);
  scene.add(keyLight);
  const cyanLight = new THREE.PointLight(0x53e5df, 26, 14, 2);
  cyanLight.position.set(4, 1.3, 2.5);
  scene.add(cyanLight);

  const root = new THREE.Group();
  scene.add(root);
  root.rotation.set(-0.12, -0.4, 0);
  let activeId = 'parking-lot';
  let raf = 0;
  let lastFrame = 0;
  let visible = true;
  let disposed = false;
  let dragging = false;
  let scaleProgress = 1;
  let liftCabin = null;
  let liftTargetY = -0.8;
  let dragStart = null;
  let clickTargets = [];
  let vendingState = 'idle';
  let selectedProduct = null;
  let vendingScreen = null;
  let vendingPanel = null;
  let vendingSimulation = null;
  const raycaster = new THREE.Raycaster();
  const materialCache = new Map();

  const material = (color, options = {}) => {
    const key = `${color}-${options.emissive ?? ''}-${options.metalness ?? 0}`;
    if (!materialCache.has(key)) materialCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.46, metalness: options.metalness ?? 0.18, emissive: options.emissive ?? 0x000000, emissiveIntensity: options.emissive ? 0.55 : 0 }));
    return materialCache.get(key);
  };
  const box = (parent, size, position, color, options) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, options));
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  };
  const cylinder = (parent, radiusTop, radiusBottom, height, position, color, segments = 16, options) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material(color, options));
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  };
  const line = (parent, points, color = 0x7789bb, opacity = 0.46) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point)));
    const mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    parent.add(mesh);
    return mesh;
  };

  function clearModel() {
    root.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material && !Array.isArray(node.material) && !materialCacheHas(node.material)) node.material.dispose();
      if (Array.isArray(node.material)) node.material.forEach((item) => { if (!materialCacheHas(item)) item.dispose(); });
    });
    for (const item of materialCache.values()) item.dispose();
    for (const child of [...root.children]) root.remove(child);
    materialCache.clear();
    liftCabin = null;
    clickTargets = [];
    selectedProduct = null;
    vendingScreen = null;
    vendingPanel = null;
    vendingSimulation = null;
    vendingState = 'idle';
  }

  function materialCacheHas(item) {
    for (const cached of materialCache.values()) if (cached === item) return true;
    return false;
  }

  function addParkingLot() {
    box(root, [5.2, 0.22, 3.6], [0, -0.72, 0], 0x2a3348, { metalness: 0.28 });
    box(root, [5.35, 0.08, 3.72], [0, -0.57, 0], 0x7782a1, { emissive: 0x151d37 });
    for (const x of [-2.05, 2.05]) for (const z of [-1.25, 1.25]) box(root, [0.12, 1.45, 0.12], [x, 0.18, z], 0x7784a5, { metalness: 0.55 });
    box(root, [4.75, 0.15, 3.2], [0, 1.02, 0], 0x323d57, { metalness: 0.34 });
    box(root, [4.9, 0.06, 3.35], [0, 1.13, 0], 0x927fff, { emissive: 0x382773 });
    for (const x of [-1.35, 0.05, 1.45]) {
      line(root, [[x - 0.52, -0.51, -1.54], [x - 0.52, -0.51, -0.1]], 0x96a8cd, 0.56);
      line(root, [[x + 0.52, -0.51, -1.54], [x + 0.52, -0.51, -0.1]], 0x96a8cd, 0.56);
    }
    const parkingSpot = box(root, [0.92, 0.04, 1.18], [1.45, -0.44, -0.78], 0x49ded5, { emissive: 0x36cfc8 });
    parkingSpot.userData.parkingSpot = true;
    clickTargets.push(parkingSpot);
    line(root, [[0.99, -0.4, -1.28], [1.91, -0.4, -1.28]], 0x69f2e8, 0.95);
    const vehicle = (x, z, bodyColor) => {
      const car = new THREE.Group();
      car.position.set(x, -0.27, z);
      root.add(car);
      box(car, [0.82, 0.27, 1.26], [0, 0, 0], bodyColor, { metalness: 0.48 });
      box(car, [0.58, 0.25, 0.66], [0, 0.23, -0.07], 0x9cadd1, { metalness: 0.35 });
      for (const wx of [-0.43, 0.43]) for (const wz of [-0.4, 0.4]) {
        const wheel = cylinder(car, 0.13, 0.13, 0.09, [wx, -0.1, wz], 0x151a26, 12);
        wheel.rotation.z = Math.PI / 2;
      }
    };
    vehicle(-1.2, 0.82, 0x8d79e8);
    vehicle(0.2, 0.82, 0x61cfc9);
    cylinder(root, 0.35, 0.35, 0.06, [-2.1, 1.45, -1.05], 0x9f8aff, 24, { emissive: 0x7760ff });
    box(root, [0.1, 0.55, 0.08], [-2.1, 1.18, -1.05], 0xa694ff);
  }

  function addVendingMachine() {
    vendingSimulation = new VendingPreview(12);
    box(root, [2.38, 3.7, 1.22], [0, 0.05, 0], 0x424661, { metalness: 0.55 });
    box(root, [2.16, 3.48, 0.09], [0, 0.05, 0.66], 0x171d30, { metalness: 0.35 });
    box(root, [1.47, 2.45, 0.07], [-0.35, 0.46, 0.73], 0x28324a, { metalness: 0.4 });
    for (let shelf = 0; shelf < 3; shelf++) {
      const y = 1.28 - shelf * 0.76;
      box(root, [1.38, 0.055, 0.18], [-0.35, y, 0.83], 0x8f7ce4, { emissive: 0x41326e });
      for (let item = 0; item < 4; item++) {
        const color = [0x63dcd2, 0xb39aff, 0xed9c77, 0x89a9ee][(item + shelf) % 4];
        const product = box(root, [0.22, 0.42, 0.2], [-0.84 + item * 0.34, y + 0.25, 0.84], color, { metalness: 0.12 });
        product.material = product.material.clone();
        product.userData.vendingProduct = true;
        product.userData.available = true;
        product.userData.productId = shelf * 4 + item;
        clickTargets.push(product);
      }
    }
    box(root, [0.46, 0.62, 0.09], [0.76, 1.2, 0.73], 0x202a40);
    vendingScreen = box(root, [0.32, 0.2, 0.035], [0.76, 1.28, 0.79], 0x4be0d0, { emissive: 0x24bfb7 });
    vendingPanel = box(root, [0.57, 0.78, 0.12], [0.76, 1.2, 0.71], 0x202a40);
    vendingPanel.userData.vendingPanel = true;
    clickTargets.push(vendingPanel);
    for (let i = 0; i < 3; i++) cylinder(root, 0.055, 0.055, 0.035, [0.76, 0.99 - i * 0.17, 0.8], 0xb7a2ff, 14, { emissive: 0x7660dc });
    box(root, [0.86, 0.44, 0.1], [-0.25, -1.15, 0.74], 0x101725);
    box(root, [0.66, 0.05, 0.04], [-0.25, -1.12, 0.81], 0x66e3d9, { emissive: 0x39bfb7 });
    for (const x of [-0.82, -0.32, 0.18, 0.68]) cylinder(root, 0.045, 0.045, 0.025, [x, 1.8, 0.65], 0x6ee2d7, 12, { emissive: 0x42c7bd });
  }

  function addElevator() {
    const floorYs = [-1.35, -0.1, 1.15];
    for (const y of floorYs) {
      box(root, [3.7, 0.13, 2.35], [0, y, 0], 0x303951, { metalness: 0.32 });
      box(root, [3.78, 0.035, 2.42], [0, y + 0.085, 0], 0x7160b0, { emissive: 0x342564 });
    }
    for (const x of [-1.65, 1.65]) for (const z of [-0.95, 0.95]) box(root, [0.12, 3.85, 0.12], [x, 0, z], 0x7e8caf, { metalness: 0.5 });
    for (const x of [-0.55, 0.55]) box(root, [0.035, 3.45, 0.045], [x, 0.03, 0.99], 0x4be0d0, { emissive: 0x21a8a2 });
    box(root, [1.12, 0.12, 1.05], [0.05, -1.22, 0], 0x58d7d0, { emissive: 0x288c91 });
    const cabin = new THREE.Group();
    root.add(cabin);
    box(cabin, [1.08, 0.95, 0.92], [0.05, 0, 0], 0x4e5775, { metalness: 0.48 });
    box(cabin, [0.82, 0.76, 0.06], [0.05, 0, 0.49], 0x20283b, { metalness: 0.3 });
    box(cabin, [0.12, 0.8, 0.03], [0.05, 0, 0.54], 0x72e5dd, { emissive: 0x299b9d });
    for (let floor = 0; floor < floorYs.length; floor++) {
      const button = cylinder(root, 0.09, 0.09, 0.06, [1.5, floorYs[floor] + 0.39, 1.02], 0x63e3dc, 20, { emissive: 0x248c89 });
      button.userData.floorRequest = floor;
      clickTargets.push(button);
    }
    liftCabin = cabin;
    liftCabin.position.y = liftTargetY;
  }

  function selectParkingSpot() {
    const spot = clickTargets.find((item) => item.userData.parkingSpot);
    if (spot) spot.material.emissive.setHex(0x55eee0);
    onPreviewEvent({ message: 'Available bay selected. Consider how your allocator prevents double parking.', type: 'selection' });
  }

  function selectVendingProduct(product = clickTargets.find((item) => item.userData.vendingProduct && item.userData.available)) {
    if (!vendingSimulation) return 'idle';
    product ??= clickTargets.find((item) => item.userData.vendingProduct && item.userData.available);
    const outcome = vendingSimulation.select(product?.userData.productId);
    if (!outcome.accepted) {
      onPreviewEvent({ message: outcome.message, type: 'hint', state: outcome.state });
      return outcome.state;
    }
    if (selectedProduct) selectedProduct.material.emissive.setHex(0x000000);
    selectedProduct = product;
    selectedProduct.material.emissive.setHex(0x39d5cd);
    vendingState = outcome.state;
    vendingScreen.material.color.setHex(0xa18bff);
    onPreviewEvent({ message: outcome.message, type: 'selection', state: vendingState });
    draw();
    return vendingState;
  }

  function advanceVending() {
    if (!vendingSimulation) return 'idle';
    const outcome = vendingSimulation.advance();
    if (outcome.action === 'paid') {
      vendingState = outcome.state;
      vendingScreen.material.color.setHex(0x63e3dc);
      onPreviewEvent({ message: outcome.message, type: 'success', state: vendingState });
    } else if (outcome.action === 'dispensed' && selectedProduct) {
      selectedProduct.position.set(-0.25, -1.3, 0.94);
      selectedProduct.material.emissive.setHex(0x000000);
      selectedProduct.userData.available = false;
      selectedProduct = null;
      vendingState = outcome.state;
      vendingScreen.material.color.setHex(0x88ddb8);
      onPreviewEvent({ message: `${outcome.message} Choose another item to continue.`, type: 'success', state: vendingState });
    } else {
      vendingState = outcome.state;
      onPreviewEvent({ message: outcome.message, type: 'hint', state: vendingState });
    }
    draw();
    return vendingState;
  }

  function requestElevatorFloor(floor) {
    if (!liftCabin || floor < 1 || floor > 3) return;
    liftTargetY = [-0.8, 0.45, 1.7][floor - 1];
    if (reducedMotion.matches) liftCabin.position.y = liftTargetY;
    onPreviewEvent({ message: `Elevator requested at floor ${floor}.`, type: 'success' });
    draw();
    start();
  }

  function addFloorGrid() {
    const grid = new THREE.GridHelper(8, 14, 0x48516c, 0x293247);
    grid.position.y = -0.87;
    grid.material.transparent = true;
    grid.material.opacity = 0.43;
    root.add(grid);
  }

  function setChallenge(id) {
    if (disposed || !['parking-lot', 'vending-machine', 'elevator'].includes(id)) return;
    activeId = id;
    clearModel();
    addFloorGrid();
    if (id === 'parking-lot') addParkingLot();
    else if (id === 'vending-machine') addVendingMachine();
    else addElevator();
    root.rotation.set(-0.12, -0.4, 0);
    root.scale.setScalar(reducedMotion.matches ? 1 : 0.86);
    scaleProgress = reducedMotion.matches ? 1 : 0;
    draw();
    const instruction = id === 'vending-machine' ? 'Choose a product, then tap the panel to simulate a purchase.' : id === 'elevator' ? 'Select a floor call button to move the elevator.' : 'Drag to orbit. The cyan bay marks an available parking spot.';
    onPreviewEvent({ message: instruction, type: 'ready' });
    if (!reducedMotion.matches) start();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw();
  }

  function draw(time = performance.now()) {
    if (disposed || !visible) return;
    if (!reducedMotion.matches && !dragging) {
      root.rotation.y += 0.000075 * Math.min(time - (lastFrame || time), 40);
      if (scaleProgress < 1) {
        scaleProgress = Math.min(1, scaleProgress + 0.055);
        const eased = 1 - (1 - scaleProgress) ** 3;
        root.scale.setScalar(0.86 + 0.14 * eased);
      }
      if (liftCabin) liftCabin.position.y = THREE.MathUtils.damp(liftCabin.position.y, liftTargetY, 4.5, Math.min((time - (lastFrame || time)) / 1000, 0.05));
    }
    renderer.render(scene, camera);
    lastFrame = time;
  }

  function loop(time) {
    if (disposed || !visible || reducedMotion.matches) { raf = 0; return; }
    raf = window.requestAnimationFrame(loop);
    if (time - lastFrame < 30) return;
    draw(time);
  }

  function start() {
    if (!raf && visible && !disposed && !reducedMotion.matches) raf = window.requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  function rotateBy(delta) {
    root.rotation.y += delta;
    draw();
    start();
  }

  function handleModelClick(event) {
    const bounds = canvas.getBoundingClientRect();
    const point = new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(point, camera);
    const hit = raycaster.intersectObjects(clickTargets, false)[0]?.object;
    if (!hit) return;
    if (activeId === 'parking-lot' && hit.userData.parkingSpot) {
      selectParkingSpot();
    } else if (activeId === 'vending-machine' && hit.userData.vendingProduct) {
      selectVendingProduct(hit);
    } else if (activeId === 'vending-machine' && hit.userData.vendingPanel) {
      advanceVending();
    } else if (activeId === 'elevator' && Number.isInteger(hit.userData.floorRequest)) {
      requestElevatorFloor(hit.userData.floorRequest + 1);
    }
    draw();
  }

  const onPointerDown = (event) => {
    dragging = true;
    canvas.setPointerCapture(event.pointerId);
    dragStart = { x: event.clientX, y: event.clientY, ry: root.rotation.y, rx: root.rotation.x };
  };
  const onPointerMove = (event) => {
    if (!dragging || !dragStart) return;
    root.rotation.y = dragStart.ry + (event.clientX - dragStart.x) * 0.009;
    root.rotation.x = THREE.MathUtils.clamp(dragStart.rx + (event.clientY - dragStart.y) * 0.006, -0.55, 0.35);
    draw();
  };
  const onPointerUp = (event) => {
    const distance = dragStart ? Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) : Infinity;
    dragging = false;
    dragStart = null;
    if (distance < 6) handleModelClick(event);
    start();
  };
  const onPointerCancel = () => { dragging = false; dragStart = null; start(); };
  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); rotateBy(-0.22); }
    if (event.key === 'ArrowRight') { event.preventDefault(); rotateBy(0.22); }
  };
  const onMotionChange = () => {
    stop();
    draw();
    if (!reducedMotion.matches) start();
  };
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('keydown', onKeyDown);
  reducedMotion.addEventListener?.('change', onMotionChange);
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  const onWindowResize = () => resize();
  if (resizeObserver) resizeObserver.observe(canvas.parentElement);
  else window.addEventListener('resize', onWindowResize);
  const visibilityObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { resize(); start(); } else stop();
  }, { threshold: 0.01 }) : null;
  if (visibilityObserver) visibilityObserver.observe(canvas);

  return {
    setChallenge,
    selectParkingSpot,
    selectVendingProduct,
    advanceVending,
    requestElevatorFloor,
    rotate: () => rotateBy(Math.PI / 4),
    dispose() {
      disposed = true;
      stop();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      window.removeEventListener('resize', onWindowResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('keydown', onKeyDown);
      reducedMotion.removeEventListener?.('change', onMotionChange);
      clearModel();
      for (const item of materialCache.values()) item.dispose();
      renderer.dispose();
    }
  };
}
