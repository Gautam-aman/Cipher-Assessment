const KEY = 'blueprint.hld.v1';
const W = 1200;
const H = 620;
const TYPES = {
  user: { label: 'Client', color: 'sand', short: 'UI' },
  gateway: { label: 'API gateway', color: 'blue', short: 'API' },
  service: { label: 'Service', color: 'teal', short: 'SV' },
  database: { label: 'Database', color: 'amber', short: 'DB' },
  cache: { label: 'Cache', color: 'rose', short: 'CA' },
  queue: { label: 'Message queue', color: 'violet', short: 'MQ' }
};

const templates = {
  'parking-lot': [
    ['user', 90, 260, 'Driver app'], ['gateway', 300, 260, 'Entry API'], ['service', 540, 150, 'Parking service'],
    ['database', 820, 140, 'Parking DB'], ['service', 540, 370, 'Payment service'], ['database', 820, 370, 'Payments DB']
  ],
  'vending-machine': [
    ['user', 90, 260, 'Customer'], ['gateway', 300, 260, 'Machine API'], ['service', 540, 150, 'Inventory service'],
    ['database', 820, 140, 'Product DB'], ['service', 540, 370, 'Payment service'], ['queue', 820, 370, 'Dispense events']
  ],
  elevator: [
    ['user', 90, 260, 'Floor panels'], ['gateway', 300, 260, 'Control API'], ['service', 540, 150, 'Dispatch service'],
    ['database', 820, 140, 'State store'], ['service', 540, 370, 'Lift controller'], ['queue', 820, 370, 'Command bus']
  ]
};

const id = () => globalThis.crypto?.randomUUID?.() ?? `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const clone = (value) => JSON.parse(JSON.stringify(value));
const escaped = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function starter(problemId) {
  const nodes = (templates[problemId] ?? templates['parking-lot']).map(([type, x, y, label]) => ({ id: id(), type, x, y, w: 174, h: 82, label }));
  const edges = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]].map(([from, to]) => ({ id: id(), from: nodes[from].id, to: nodes[to].id }));
  return { nodes, edges };
}

function load(problemId) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')[problemId];
    if (saved && Array.isArray(saved.nodes) && Array.isArray(saved.edges)) return saved;
  } catch { /* use the starter board when storage is unavailable */ }
  return starter(problemId);
}

export function createHldStudio(root, initialProblemId) {
  const svg = root.querySelector('.hld-canvas');
  const status = root.querySelector('.hld-save-status');
  const toolButtons = [...root.querySelectorAll('[data-hld-tool]')];
  let problemId = initialProblemId;
  let model = load(problemId);
  let mode = 'select';
  let selectedId = null;
  let connectFrom = null;
  let drag = null;
  const undoStack = [];

  function persist() {
    try {
      const all = JSON.parse(localStorage.getItem(KEY) || '{}');
      all[problemId] = model;
      localStorage.setItem(KEY, JSON.stringify(all));
      status.textContent = 'Saved in this browser';
    } catch {
      status.textContent = 'Storage unavailable';
    }
  }

  function snapshot() {
    undoStack.push(clone(model));
    if (undoStack.length > 40) undoStack.shift();
  }

  function anchor(node, other) {
    const a = { x: node.x + node.w / 2, y: node.y + node.h / 2 };
    const b = { x: other.x + other.w / 2, y: other.y + other.h / 2 };
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const scale = Math.min((node.w * .46) / Math.max(Math.abs(dx), 1), (node.h * .42) / Math.max(Math.abs(dy), 1));
    const scale2 = Math.min((other.w * .46) / Math.max(Math.abs(dx), 1), (other.h * .42) / Math.max(Math.abs(dy), 1));
    const x1 = a.x + dx * scale;
    const y1 = a.y + dy * scale;
    const x2 = b.x - dx * scale2;
    const y2 = b.y - dy * scale2;
    const bend = Math.min(34, Math.abs(x2 - x1) * .08 + Math.abs(y2 - y1) * .035);
    return `M ${x1} ${y1} C ${x1 + dx * .32} ${y1 + (dy > 0 ? bend : -bend)}, ${x2 - dx * .32} ${y2 - (dy > 0 ? bend : -bend)}, ${x2} ${y2}`;
  }

  function render() {
    const edgeMarkup = model.edges.map((edge) => {
      const from = model.nodes.find((node) => node.id === edge.from);
      const to = model.nodes.find((node) => node.id === edge.to);
      if (!from || !to) return '';
      const path = anchor(from, to);
      return `<g class="hld-edge"><path class="hld-edge-shadow" d="${path}"/><path class="hld-edge-line" d="${path}" marker-end="url(#hld-arrow)"/></g>`;
    }).join('');
    const nodeMarkup = model.nodes.map((node, index) => {
      const spec = TYPES[node.type] ?? TYPES.service;
      const selected = selectedId === node.id;
      const x = node.x, y = node.y, w = node.w, h = node.h;
      const rough = `M ${x + 5} ${y + 2} Q ${x + w * .48} ${y - 1 + index % 2} ${x + w - 3} ${y + 4} L ${x + w - 1} ${y + h * .49} Q ${x + w + 1} ${y + h - 3} ${x + w - 5} ${y + h - 1} L ${x + w * .52} ${y + h + 1} Q ${x + 2} ${y + h + 1} ${x + 3} ${y + h - 4} Z`;
      return `<g class="hld-node ${spec.color} ${selected ? 'is-selected' : ''}" data-node="${node.id}" tabindex="0" role="button" aria-label="${escaped(node.label)}. Double-click to rename." transform="translate(0 0)">
        ${selected ? `<path class="hld-selection" d="M ${x - 6} ${y - 5} h ${w + 12} v ${h + 10} h ${-(w + 12)} Z"/>` : ''}
        <path class="hld-node-shape" d="${rough}"/><path class="hld-node-echo" d="M ${x + 7} ${y + 4} Q ${x + w * .45} ${y + 1} ${x + w - 5} ${y + 7} L ${x + w - 4} ${y + h - 5} Q ${x + w * .52} ${y + h - 2} ${x + 6} ${y + h - 6} Z"/>
        <circle class="hld-node-dot" cx="${x + 19}" cy="${y + 20}" r="4"/><text class="hld-node-type" x="${x + 31}" y="${y + 23}">${spec.label.toUpperCase()}</text>
        <text class="hld-node-label" x="${x + 17}" y="${y + 53}">${escaped(node.label.slice(0, 23))}</text>
      </g>`;
    }).join('');
    const prompt = connectFrom ? '<div class="hld-canvas-prompt">Now choose a destination component <button type="button" data-hld-cancel>Cancel</button></div>' : '';
    svg.innerHTML = `<defs><pattern id="hld-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#6b83a522" stroke-width=".7"/></pattern><marker id="hld-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="#4865bd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
      <rect width="${W}" height="${H}" class="hld-paper"/><rect width="${W}" height="${H}" fill="url(#hld-grid)"/>
      <g class="hld-connections">${edgeMarkup}</g><g class="hld-components">${nodeMarkup}</g>`;
    root.querySelector('.hld-canvas-wrap').classList.toggle('is-connecting', Boolean(connectFrom));
    root.querySelector('.hld-canvas-wrap').dataset.mode = mode;
    toolButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.hldTool === mode || button.dataset.hldTool === `add:${mode}`)));
    root.querySelector('.hld-canvas-prompt')?.remove();
    if (prompt) root.querySelector('.hld-canvas-wrap').insertAdjacentHTML('beforeend', prompt);
  }

  function point(event) {
    const p = svg.createSVGPoint();
    p.x = event.clientX; p.y = event.clientY;
    const local = p.matrixTransform(svg.getScreenCTM().inverse());
    return { x: local.x, y: local.y };
  }

  function addNode(type) {
    snapshot();
    const offset = model.nodes.length % 5 * 22;
    const node = { id: id(), type, x: Math.max(24, W / 2 - 87 + offset), y: Math.max(24, H / 2 - 41 + offset), w: 174, h: 82, label: TYPES[type].label };
    model.nodes.push(node);
    selectedId = node.id;
    mode = 'select';
    render(); persist();
  }

  function undo() {
    if (!undoStack.length) return;
    model = undoStack.pop();
    selectedId = null; connectFrom = null;
    render(); persist();
  }

  root.addEventListener('click', (event) => {
    const tool = event.target.closest('[data-hld-tool]');
    if (tool) {
      const value = tool.dataset.hldTool;
      if (value.startsWith('add:')) addNode(value.slice(4));
      else if (value === 'undo') undo();
      else if (value === 'clear') { snapshot(); model = { nodes: [], edges: [] }; selectedId = null; render(); persist(); }
      else if (value === 'export') exportSvg();
      else { mode = value; connectFrom = null; render(); }
      return;
    }
    if (event.target.closest('[data-hld-cancel]')) { connectFrom = null; mode = 'select'; render(); return; }
    if (event.target === svg && selectedId) { selectedId = null; render(); return; }
    if (mode === 'connect' && event.target.closest('[data-node]')) {
      const nodeId = event.target.closest('[data-node]').dataset.node;
      if (!connectFrom) { connectFrom = nodeId; selectedId = nodeId; render(); }
      else if (connectFrom !== nodeId && !model.edges.some((edge) => edge.from === connectFrom && edge.to === nodeId)) {
        snapshot(); model.edges.push({ id: id(), from: connectFrom, to: nodeId }); connectFrom = null; mode = 'select'; render(); persist();
      }
    }
  });

  root.addEventListener('pointerdown', (event) => {
    const group = event.target.closest('[data-node]');
    if (!group || mode !== 'select' || connectFrom) return;
    const node = model.nodes.find((item) => item.id === group.dataset.node);
    if (!node) return;
    event.preventDefault();
    selectedId = node.id;
    svg.focus({ preventScroll: true });
    snapshot();
    const p = point(event);
    drag = { node, dx: p.x - node.x, dy: p.y - node.y, moved: false };
    svg.setPointerCapture(event.pointerId);
    render();
  });
  svg.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const p = point(event);
    const x = Math.min(W - drag.node.w - 12, Math.max(12, p.x - drag.dx));
    const y = Math.min(H - drag.node.h - 12, Math.max(12, p.y - drag.dy));
    if (Math.abs(x - drag.node.x) + Math.abs(y - drag.node.y) > 1) drag.moved = true;
    drag.node.x = x; drag.node.y = y;
    render();
  });
  const finishDrag = () => { if (drag?.moved) persist(); drag = null; };
  svg.addEventListener('pointerup', finishDrag);
  svg.addEventListener('pointercancel', finishDrag);
  svg.addEventListener('dblclick', (event) => {
    const group = event.target.closest('[data-node]');
    if (!group) return;
    const node = model.nodes.find((item) => item.id === group.dataset.node);
    const label = window.prompt('Name this component', node?.label ?? '');
    if (node && label?.trim()) { snapshot(); node.label = label.trim().slice(0, 40); selectedId = node.id; render(); persist(); }
  });
  root.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); return; }
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId && !/INPUT|TEXTAREA/.test(event.target.tagName)) {
      snapshot(); model.nodes = model.nodes.filter((node) => node.id !== selectedId); model.edges = model.edges.filter((edge) => edge.from !== selectedId && edge.to !== selectedId); selectedId = null; render(); persist();
    }
    if (event.key === 'Escape' && (connectFrom || mode !== 'select')) { connectFrom = null; mode = 'select'; render(); }
  });

  function exportSvg() {
    const copy = svg.cloneNode(true);
    const styles = `<style>.hld-paper{fill:#fcfcfa}.hld-edge-line{fill:none;stroke:#4865bd;stroke-width:2;stroke-linecap:round;stroke-dasharray:8 5}.hld-edge-shadow{fill:none;stroke:#4865bd33;stroke-width:5;stroke-linecap:round}.hld-node-shape{fill:#f2f5ff;stroke:#4966bd;stroke-width:2;stroke-linejoin:round}.hld-node-echo{fill:none;stroke:#4966bd66;stroke-width:1}.hld-node-type{fill:#718096;font:10px monospace;letter-spacing:1.5px}.hld-node-label{fill:#26374e;font:600 18px sans-serif}.hld-node-dot{fill:#4966bd}</style>`;
    copy.insertAdjacentHTML('afterbegin', styles);
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `blueprint-${problemId}-hld.svg`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function setChallenge(nextProblemId) {
    problemId = nextProblemId;
    model = load(problemId);
    selectedId = null; connectFrom = null; mode = 'select'; undoStack.length = 0;
    render(); persist();
  }

  render(); persist();
  return { setChallenge };
}
