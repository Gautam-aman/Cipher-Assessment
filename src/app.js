import { problems } from './problems.js';
import { evaluateSubmission, validateSubmission } from './evaluation.js';
import { loadState, saveState } from './storage.js';
import { VendingPreview } from './vending.js';

const state = loadState();
let activeId = problems[0].id;
let studioScene = null;
let sceneLoad = null;
let fallbackTurn = 0;
let fallbackVending = new VendingPreview();
let previewVendingState = 'idle';
let parkingDemoRunning = true;
let requestedFloor = null;
let revisionBaseAttemptId = null;
let viewedAttempt = null;
const $ = (selector) => document.querySelector(selector);
const esc = (value = '') => String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const activeProblem = () => problems.find((problem) => problem.id === activeId);
const draftFor = (id = activeId) => state.drafts[id] ?? { requirements: '', classes: '', relationships: '', tradeoffs: '' };
const save = () => saveState(state);
const challengeIcons = {
  'parking-lot': '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 20V4h7a5 5 0 0 1 0 10H6m0-5h7"/><path d="M17 18h2m-12 0h7l-1-4H8l-1 4Z"/></svg>',
  'vending-machine': '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6v5H9zM8 16h5m3 0h.01M8 18h8"/></svg>',
  elevator: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 7V4m0 0L10 6m2-2 2 2m-2 9v3m0 0-2-2m2 2 2-2M8 10h8"/></svg>'
};
const previewDescriptions = {
  'parking-lot': 'Multi-level parking structure with a highlighted available spot.',
  'vending-machine': 'Vending machine showing product shelves, payment controls, and dispensing slot.',
  elevator: 'Three-floor elevator system with a moving lift cabin.'
};

function renderProblems() {
  $('#problem-list').innerHTML = problems.map((problem) => {
    const attempts = state.attempts.filter((item) => item.problemId === problem.id).length;
    const key = problem.id === 'elevator' ? 'elevator' : problem.id;
    return `<button class="problem-card ${activeId === problem.id ? 'selected' : ''}" data-problem="${problem.id}" aria-label="${esc(problem.title)}, ${esc(problem.level)}, ${problem.minutes} minute challenge, ${attempts} previous attempts" aria-pressed="${activeId === problem.id}">
      <span class="mission-icon mission-icon-${key}">${challengeIcons[key]}</span><span class="mission-content"><span class="mission-title-row"><strong>${esc(problem.title)}</strong><span class="mission-status ${attempts ? 'practiced' : ''}">${attempts ? `${attempts} ${attempts === 1 ? 'TRY' : 'TRIES'}` : 'NEW'}</span></span><small>${esc(problem.category)}</small><span class="mission-meta"><span>${esc(problem.level)}</span><i>·</i><span>${problem.minutes} MIN</span></span></span><span class="mission-arrow">↗</span></button>`;
  }).join('');
  renderChallengeGallery();
}

function renderChallengeGallery() {
  const gallery = $('#challenge-gallery');
  if (!gallery) return;
  if (gallery.dataset.rendered === 'true') {
    gallery.querySelectorAll('[data-problem]').forEach((card) => {
      const selected = card.dataset.problem === activeId;
      card.classList.toggle('is-active', selected);
      card.setAttribute('aria-pressed', String(selected));
      card.querySelector('.gallery-active-mark').innerHTML = `${selected ? 'SELECTED' : 'EXPLORE'} <b>↗</b>`;
      card.querySelector('.gallery-card-action').innerHTML = `${selected ? 'Continue this design' : 'Start this challenge'} <b>↗</b>`;
    });
    return;
  }
  gallery.innerHTML = problems.map((problem, index) => `<button class="gallery-card gallery-card-${problem.id} ${activeId === problem.id ? 'is-active' : ''}" type="button" data-problem="${problem.id}" aria-pressed="${activeId === problem.id}" aria-label="Choose ${esc(problem.title)}, ${esc(problem.level)}, ${problem.minutes} minute challenge">
    <span class="gallery-card-top"><span>CHALLENGE / 0${index + 1}</span><span class="gallery-active-mark">${activeId === problem.id ? 'SELECTED' : 'EXPLORE'} <b>↗</b></span></span>
    <span class="gallery-art" aria-hidden="true"><i class="gallery-orbit orbit-a"></i><i class="gallery-orbit orbit-b"></i><i class="gallery-art-glow"></i><span class="gallery-art-icon">${challengeIcons[problem.id]}</span><span class="gallery-art-index">0${index + 1}</span></span>
    <span class="gallery-card-copy"><span class="gallery-card-meta">${esc(problem.level)} <i>·</i> ${problem.minutes} MIN</span><strong>${esc(problem.title)}</strong><span class="gallery-card-summary">${esc(problem.summary)}</span><span class="gallery-card-action">${activeId === problem.id ? 'Continue this design' : 'Start this challenge'} <b>↗</b></span></span>
  </button>`).join('');
  gallery.dataset.rendered = 'true';
}

function renderProblem() {
  const problem = activeProblem();
  viewedAttempt = null;
  revisionBaseAttemptId = null;
  fallbackVending.reset();
  previewVendingState = 'idle';
  parkingDemoRunning = true;
  requestedFloor = null;
  $('#problem-level').textContent = problem.level;
  $('#problem-title').textContent = problem.title;
  $('#problem-summary').textContent = problem.summary;
  $('#problem-time').textContent = `${problem.minutes} MIN ESTIMATE`;
  $('#requirements').innerHTML = problem.requirements.map((item) => `<li>${esc(item)}</li>`).join('');
  $('#extension-prompt').textContent = problem.extension;
  $('#scene-label').textContent = `${problem.title.toUpperCase()} / SYSTEM MODEL`;
  $('#scene-canvas').setAttribute('aria-label', `Interactive 3D ${problem.title} preview. ${previewDescriptions[problem.id]} Drag to rotate; use arrow keys to turn the view.`);
  $('#fallback-title').textContent = problem.title;
  $('#fallback-description').textContent = previewDescriptions[problem.id];
  $('#fallback-art').innerHTML = challengeIcons[problem.id];
  fallbackTurn = 0;
  $('#scene-fallback-visual').className = 'fallback-visual';
  renderSceneActions(problem);
  if (studioScene) studioScene.setChallenge(problem.id);
  for (const field of ['requirements', 'classes', 'relationships', 'tradeoffs']) $(`#${field}-input`).value = draftFor()[field] ?? '';
  updateDraftProgress(draftFor());
  setPracticeStep(Object.values(draftFor()).some((value) => String(value).trim()) ? 'design' : 'choose');
  $('#draft-status').textContent = Object.values(draftFor()).some((value) => String(value).trim()) ? 'DRAFT IN PROGRESS' : 'READY TO DESIGN';
  $('#field-count').textContent = `${state.attempts.filter((item) => item.problemId === activeId).length} previous ${state.attempts.some((item) => item.problemId === activeId) ? 'attempts' : 'attempts so far'}`;
  renderEmptyReview();
  renderProblems();
  renderHistory();
  renderRevisionPanel();
}

function renderHistory() {
  const attempts = state.attempts.filter((item) => item.problemId === activeId).slice().reverse();
  $('#history-list').innerHTML = attempts.length ? attempts.slice(0, 5).map((attempt) => `<button class="history-item" data-attempt="${esc(attempt.id)}"><span class="history-dot"></span><span class="history-main"><strong>Attempt ${attempt.number}${attempt.revisionOf ? ' <i>REVISION</i>' : ''}</strong><small>${new Date(attempt.createdAt).toLocaleString()}</small></span><span class="history-score">${attempt.evaluation.score}<small>/100</small></span></button>`).join('') : `<div class="history-empty">No attempts yet. Your first design starts the learning loop.</div>`;
  $('#clear-history').disabled = attempts.length === 0;
}

function renderRevisionPanel() {
  const attempts = state.attempts.filter((item) => item.problemId === activeId).sort((a, b) => a.number - b.number);
  const latest = attempts.at(-1);
  const revisionBase = state.attempts.find((item) => item.id === revisionBaseAttemptId && item.problemId === activeId);
  const current = revisionBase ?? (viewedAttempt && viewedAttempt.problemId === activeId ? viewedAttempt : latest);
  $('#revision-load').disabled = !current;
  $('#revision-load').innerHTML = `${revisionBase || viewedAttempt?.problemId === activeId ? `Revise attempt ${current.number}` : 'Revise latest attempt'} <span>↗</span>`;
  if (!attempts.length) {
    $('#revision-summary').innerHTML = `<div class="revision-empty"><strong>Your learning loop starts with a review.</strong><span>Submit one design to see score changes and focused revision ideas here.</span></div>`;
    $('#revision-targets').innerHTML = '';
  } else {
    const score = latest.evaluation.score;
    const delta = attempts.length > 1 ? score - attempts.at(-2).evaluation.score : null;
    const bars = attempts.slice(-6).map((attempt) => `<span class="revision-bar" style="--bar-height:${Math.max(8, attempt.evaluation.score)}%" title="Attempt ${attempt.number}: ${attempt.evaluation.score}/100"><i>${attempt.number}</i></span>`).join('');
    $('#revision-summary').innerHTML = `<div class="revision-metrics"><div class="revision-score"><strong>${score}</strong><span>/100 current</span></div><div class="revision-change ${delta > 0 ? 'is-up' : delta < 0 ? 'is-down' : ''}">${delta == null ? '<span>FIRST REVIEW</span>' : `<strong>${delta > 0 ? '+' : ''}${delta}</strong><span>since last attempt</span>`}</div><div class="revision-bars" role="img" aria-label="Score trend across ${attempts.length} attempts">${bars}</div></div>`;
    const lowest = current.evaluation.criteria.slice().sort((a, b) => a.score - b.score).slice(0, 2);
    $('#revision-targets').innerHTML = `<div class="revision-target-heading">${current.id !== latest.id ? `ATTEMPT ${current.number} REVIEW TARGETS` : 'POSSIBLE NEXT REVISION'}</div><ul>${lowest.map((item) => `<li><span>${esc(item.label)}</span><b>${item.score}/4</b></li>`).join('')}</ul>`;
  }
  $('#revision-focus').value = state.revisions.focuses[activeId] ?? '';
  const notes = Array.isArray(state.revisions.notes[activeId]) ? state.revisions.notes[activeId] : [];
  $('#key-note-list').innerHTML = notes.length ? notes.map((note) => `<li class="key-note"><span>${esc(note.text)}</span><small>${new Date(note.createdAt).toLocaleDateString()}</small><button type="button" data-delete-note="${esc(note.id)}" aria-label="Delete note: ${esc(note.text)}">×</button></li>`).join('') : `<li class="key-notes-empty">No key notes saved for this challenge yet.</li>`;
}

function collectDraft() {
  return Object.fromEntries(['requirements', 'classes', 'relationships', 'tradeoffs'].map((field) => [field, $(`#${field}-input`).value]));
}

function updateDraftProgress(draft) {
  const ready = [
    draft.requirements?.trim().length >= 20,
    draft.classes?.trim().length >= 20,
    draft.relationships?.trim().length >= 12,
    draft.tradeoffs?.trim().length >= 20
  ].filter(Boolean).length;
  $('#draft-completion-label').textContent = `${ready} / 4 ready`;
  $('#draft-progress').setAttribute('aria-valuenow', String(ready));
  $('#draft-progress').setAttribute('data-ready', String(ready));
}

function renderSceneActions(problem) {
  const actions = $('#scene-actions');
  if (problem.id === 'parking-lot') {
    actions.innerHTML = `<button class="scene-action" type="button" data-preview-action="spot">Highlight available bay <span>↗</span></button><button class="scene-action scene-action-secondary" type="button" data-preview-action="parking-toggle">${parkingDemoRunning ? 'Pause demo' : 'Resume demo'}</button><button class="scene-action scene-action-secondary" type="button" data-preview-action="parking-reset">Reset</button>`;
  } else if (problem.id === 'vending-machine') {
    const vendingState = studioScene ? previewVendingState : fallbackVending.state;
    const canSelect = vendingState === 'idle' || vendingState === 'dispensed';
    const canAdvance = vendingState === 'selected' || vendingState === 'paid';
    const selectLabel = vendingState === 'selected' ? 'Product selected' : vendingState === 'paid' ? 'Payment ready' : 'Choose product';
    const nextLabel = vendingState === 'selected' ? 'Simulate payment' : vendingState === 'paid' ? 'Dispense item' : 'Next step';
    actions.innerHTML = `<button class="scene-action ${canSelect ? '' : 'is-current'}" type="button" data-preview-action="product" ${canSelect ? '' : 'disabled'}>${selectLabel}</button><button class="scene-action scene-action-secondary" type="button" data-preview-action="vending-next" ${canAdvance ? '' : 'disabled'}>${nextLabel}</button><button class="scene-action scene-action-secondary" type="button" data-preview-action="vending-reset">Reset</button>`;
  } else {
    actions.innerHTML = `<span class="scene-action-label">CALL ELEVATOR</span>${[1, 2, 3].map((floor) => `<button class="scene-action scene-floor ${requestedFloor === floor ? 'is-current' : ''}" type="button" data-floor="${floor}" aria-label="Request elevator at floor ${floor}" aria-pressed="${requestedFloor === floor}">${floor}</button>`).join('')}`;
  }
}

function renderEmptyReview() {
  $('#feedback-panel').innerHTML = `<div class="feedback-empty"><div class="empty-icon">↗</div><strong>Your review takes shape here</strong><p>Submit a design to get a clear, evidence-based review across six dimensions.</p><span class="review-empty-tag">NO SUBMISSION YET</span></div>`;
}

async function ensureScene() {
  if (studioScene || sceneLoad) return sceneLoad;
  $('#scene-status').innerHTML = '<i></i> LOADING MODEL';
  sceneLoad = import('./scene.js').then(({ createStudioScene }) => {
    $('#scene-canvas').hidden = false;
    studioScene = createStudioScene($('#scene-canvas'), { onPreviewEvent: ({ message, state: vendingState }) => {
      $('#scene-feedback').textContent = message;
      if (vendingState) {
        previewVendingState = vendingState;
        renderSceneActions(activeProblem());
      }
    } });
    studioScene.setChallenge(activeId);
    if (!parkingDemoRunning && activeId === 'parking-lot') studioScene.toggleParking();
    $('#scene-fallback').hidden = true;
    $('#scene-status').innerHTML = '<i></i> INTERACTIVE 3D';
    return studioScene;
  }).catch(() => {
    $('#scene-canvas').hidden = true;
    $('#scene-fallback').hidden = false;
    $('#scene-status').innerHTML = '<i></i> STATIC PREVIEW';
    $('#scene-stage').classList.add('fallback-active');
    $('#scene-feedback').textContent = 'Use the rotate control to explore this challenge.';
    return null;
  }).finally(() => { sceneLoad = null; });
  return sceneLoad;
}

function setPracticeStep(step) {
  for (const name of ['choose', 'design', 'reflect']) {
    const item = $(`#step-${name}`);
    item.classList.toggle('loop-active', name === step);
    item.classList.toggle('loop-done', ['choose', 'design', 'reflect'].indexOf(name) < ['choose', 'design', 'reflect'].indexOf(step));
    if (name === step) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  }
}

function renderFeedback(evaluation) {
  if (evaluation.status === 'invalid') {
    $('#feedback-panel').innerHTML = `<div class="feedback-error"><strong>A little more detail before review</strong><p>Complete these sections, then submit again:</p><ul>${evaluation.missing.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div>`;
    return;
  }
  const strong = evaluation.criteria.filter((item) => item.score >= 3).length;
  const circumference = 106.81;
  const ringOffset = (circumference * (100 - evaluation.score) / 100).toFixed(2);
  $('#feedback-panel').innerHTML = `<div class="review-top"><div><span class="eyebrow">DESIGN REVIEW</span><h3>${strong >= 4 ? 'A solid foundation' : 'A useful first pass'}</h3></div><div class="score-ring" role="img" aria-label="Design review score: ${evaluation.score} out of 100"><svg viewBox="0 0 40 40" aria-hidden="true"><circle class="score-track" cx="20" cy="20" r="17"/><circle class="score-progress" cx="20" cy="20" r="17" stroke-dasharray="${circumference}" stroke-dashoffset="${ringOffset}" transform="rotate(-90 20 20)"/></svg><span>${evaluation.score}</span><small>/100</small></div></div>
    <p class="review-intro">A rubric based review of the evidence in your submission. Use each suggestion to shape your next attempt.</p>
    <div class="criteria-list">${evaluation.criteria.map((item) => `<article class="criterion"><div class="criterion-head"><strong>${esc(item.label)}</strong><span>${item.score}<small> / 4</small></span></div><div class="score-bars">${[1,2,3,4].map((n) => `<i class="${n <= item.score ? 'filled' : ''}"></i>`).join('')}</div><p>${esc(item.feedback)}</p></article>`).join('')}</div>
    <div class="review-footnote"><span>ⓘ</span> Scores reflect rubric evidence, not a single “correct” design. This prototype uses deterministic keyword checks; human or AI review can plug into the same evaluation contract.</div>`;
}

$('#problem-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-problem]');
  if (!button) return;
  selectChallenge(button.dataset.problem);
});

function selectChallenge(id, jumpToEditor = false) {
  if (!problems.some((problem) => problem.id === id)) return;
  activeId = id;
  renderProblem();
  if (jumpToEditor) $('#problem-title').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
}

$('#challenge-gallery').addEventListener('click', (event) => {
  const button = event.target.closest('[data-problem]');
  if (button) selectChallenge(button.dataset.problem, true);
});

document.querySelectorAll('.magnetic-button').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || event.pointerType === 'touch') return;
    const rect = button.getBoundingClientRect();
    button.style.setProperty('--magnet-x', `${(event.clientX - rect.left - rect.width / 2) * 0.11}px`);
    button.style.setProperty('--magnet-y', `${(event.clientY - rect.top - rect.height / 2) * 0.16}px`);
  });
  button.addEventListener('pointerleave', () => {
    button.style.setProperty('--magnet-x', '0px');
    button.style.setProperty('--magnet-y', '0px');
  });
});

const galleryElement = $('#challenge-gallery');
galleryElement.addEventListener('pointermove', (event) => {
  const card = event.target.closest('.gallery-card');
  if (!card || event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  card.style.setProperty('--tilt-x', `${x * 5}deg`);
  card.style.setProperty('--tilt-y', `${-y * 5}deg`);
  card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`);
  card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`);
});
galleryElement.addEventListener('pointerout', (event) => {
  const card = event.target.closest('.gallery-card');
  if (!card || card.contains(event.relatedTarget)) return;
  card.style.setProperty('--tilt-x', '0deg');
  card.style.setProperty('--tilt-y', '0deg');
});

$('#workspace-form').addEventListener('input', () => {
  viewedAttempt = null;
  const draft = collectDraft();
  state.drafts[activeId] = draft;
  updateDraftProgress(draft);
  setPracticeStep('design');
  if (!save()) announce('Draft saved for this session. Browser storage is unavailable.');
  const total = Object.values(collectDraft()).join('').length;
  $('#draft-status').textContent = total ? 'DRAFT SAVED' : 'READY TO DESIGN';
});

$('#workspace-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const draft = collectDraft();
  const missing = validateSubmission(draft);
  if (missing.length) {
    renderFeedback({ status: 'invalid', missing });
    $('#feedback-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }
  const evaluation = evaluateSubmission(draft, activeProblem());
  const number = state.attempts.filter((item) => item.problemId === activeId).length + 1;
  const attempt = { id: crypto.randomUUID(), problemId: activeId, number, createdAt: new Date().toISOString(), submission: draft, revisionOf: revisionBaseAttemptId, status: 'completed', evaluation };
  state.attempts.push(attempt);
  revisionBaseAttemptId = null;
  viewedAttempt = attempt;
  delete state.drafts[activeId];
  const persisted = save();
  renderFeedback(evaluation);
  setPracticeStep('reflect');
  renderProblemFieldsReset();
  renderProblems();
  renderHistory();
  renderRevisionPanel();
  $('#draft-status').textContent = persisted ? 'REVIEW COMPLETE' : 'REVIEW COMPLETE · SESSION ONLY';
  $('#feedback-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

function renderProblemFieldsReset() {
  for (const field of ['requirements', 'classes', 'relationships', 'tradeoffs']) $(`#${field}-input`).value = '';
  updateDraftProgress({});
}

function announce(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  setTimeout(() => $('#toast').classList.remove('visible'), 2600);
}

$('#history-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-attempt]');
  if (!button) return;
  const attempt = state.attempts.find((item) => item.id === button.dataset.attempt);
  if (!attempt) return;
  viewedAttempt = attempt;
  renderFeedback(attempt.evaluation);
  renderRevisionPanel();
  setPracticeStep('reflect');
  $('#draft-status').textContent = `VIEWING ATTEMPT ${attempt.number}`;
});

$('#new-attempt').addEventListener('click', () => {
  viewedAttempt = null;
  revisionBaseAttemptId = null;
  for (const field of ['requirements', 'classes', 'relationships', 'tradeoffs']) $(`#${field}-input`).value = '';
  state.drafts[activeId] = { requirements: '', classes: '', relationships: '', tradeoffs: '' };
  save();
  renderEmptyReview();
  $('#draft-status').textContent = 'READY TO DESIGN';
  updateDraftProgress(state.drafts[activeId]);
  setPracticeStep('choose');
  $('#requirements-input').focus();
});

$('#clear-history').addEventListener('click', () => {
  state.attempts = [];
  viewedAttempt = null;
  save();
  renderProblems();
  renderHistory();
  renderRevisionPanel();
  announce('Attempt history cleared.');
});

$('#revision-focus').addEventListener('input', (event) => {
  state.revisions.focuses[activeId] = event.currentTarget.value;
  const saved = save();
  $('#revision-save-status').textContent = saved ? 'Saved for this challenge' : 'Could not save in this browser';
  $('#revision-save-status').classList.toggle('save-error', !saved);
});

$('#key-note-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('#key-note-input');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  const notes = Array.isArray(state.revisions.notes[activeId]) ? state.revisions.notes[activeId] : [];
  notes.unshift({ id: crypto.randomUUID(), text, createdAt: new Date().toISOString() });
  state.revisions.notes[activeId] = notes;
  input.value = '';
  save();
  renderRevisionPanel();
  input.focus();
});

$('#key-note-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-delete-note]');
  if (!button) return;
  state.revisions.notes[activeId] = (state.revisions.notes[activeId] ?? []).filter((note) => note.id !== button.dataset.deleteNote);
  save();
  renderRevisionPanel();
});

$('#revision-load').addEventListener('click', () => {
  const attempts = state.attempts.filter((item) => item.problemId === activeId);
  const attempt = viewedAttempt?.problemId === activeId ? viewedAttempt : attempts.at(-1);
  if (!attempt) return;
  revisionBaseAttemptId = attempt.id;
  viewedAttempt = null;
  for (const field of ['requirements', 'classes', 'relationships', 'tradeoffs']) $(`#${field}-input`).value = attempt.submission[field] ?? '';
  state.drafts[activeId] = collectDraft();
  save();
  updateDraftProgress(state.drafts[activeId]);
  setPracticeStep('design');
  $('#draft-status').textContent = `REVISING ATTEMPT ${attempt.number}`;
  renderRevisionPanel();
  $('#requirements-input').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  $('#requirements-input').focus({ preventScroll: true });
  announce(`Attempt ${attempt.number} loaded as a new revision. The original is preserved.`);
});

$('#sidebar-toggle').addEventListener('click', (event) => {
  const collapsed = document.querySelector('.shell').classList.toggle('sidebar-collapsed');
  event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
  event.currentTarget.setAttribute('aria-label', collapsed ? 'Expand challenge navigation' : 'Collapse challenge navigation');
  event.currentTarget.title = collapsed ? 'Expand navigation' : 'Collapse navigation';
});

function openPresentation() {
  const recentAttempt = viewedAttempt ?? (!Object.values(collectDraft()).some((value) => value.trim()) ? state.attempts.filter((item) => item.problemId === activeId).at(-1) : null);
  const problem = recentAttempt ? problems.find((item) => item.id === recentAttempt.problemId) : activeProblem();
  const draft = recentAttempt?.submission ?? collectDraft();
  const sections = [
    ['Requirements & assumptions', draft.requirements],
    ['Classes & responsibilities', draft.classes],
    ['Relationships & flow', draft.relationships],
    ['Trade-offs, edge cases & tests', draft.tradeoffs]
  ];
  $('#presentation-problem').textContent = `${problem.title} · ${problem.level} · ${problem.minutes} minute design challenge${recentAttempt ? ` · Attempt ${recentAttempt.number}` : ' · Current draft'}`;
  $('#presentation-content').innerHTML = sections.map(([title, value], index) => `<article class="presentation-section ${value.trim() ? '' : 'is-empty'}"><header><span>0${index + 1}</span><h3>${title}</h3></header><p>${value.trim() ? esc(value) : 'Not added to this draft yet.'}</p></article>`).join('');
  $('#presentation-dialog').showModal();
}

$('#presentation-open').addEventListener('click', openPresentation);
$('#presentation-close').addEventListener('click', () => $('#presentation-dialog').close());
$('#presentation-edit').addEventListener('click', () => {
  $('#presentation-dialog').close();
  $('#requirements-input').focus();
  $('#requirements-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('#presentation-dialog').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

$('#scene-rotate').addEventListener('click', () => {
  if (studioScene) studioScene.rotate();
  else {
    fallbackTurn = (fallbackTurn + 1) % 4;
    $('#scene-fallback-visual').className = `fallback-visual turn-${fallbackTurn}`;
  }
});

$('#scene-actions').addEventListener('click', (event) => {
  const button = event.target.closest('[data-preview-action], [data-floor]');
  if (!button || button.disabled) return;
  if (button.dataset.previewAction === 'spot') {
    if (studioScene) studioScene.selectParkingSpot();
    else $('#scene-feedback').textContent = 'Available bay selected. Consider how your allocator prevents double parking.';
  } else if (button.dataset.previewAction === 'product') {
    if (studioScene) studioScene.selectVendingProduct();
    else {
      const outcome = fallbackVending.select();
      previewVendingState = outcome.state;
      $('#scene-feedback').textContent = outcome.message;
      renderSceneActions(activeProblem());
    }
  } else if (button.dataset.previewAction === 'parking-toggle') {
    parkingDemoRunning = studioScene ? studioScene.toggleParking() : !parkingDemoRunning;
    $('#scene-feedback').textContent = parkingDemoRunning ? 'Parking demo resumed. Cars are entering and leaving the lot.' : 'Parking demo paused.';
    renderSceneActions(activeProblem());
  } else if (button.dataset.previewAction === 'parking-reset') {
    parkingDemoRunning = true;
    studioScene?.resetParking();
    $('#scene-feedback').textContent = 'Parking demo reset. The vehicles will cycle through the bays again.';
    renderSceneActions(activeProblem());
  } else if (button.dataset.previewAction === 'vending-next') {
    if (studioScene) studioScene.advanceVending();
    else {
      const outcome = fallbackVending.advance();
      previewVendingState = outcome.state;
      $('#scene-feedback').textContent = outcome.message;
      renderSceneActions(activeProblem());
    }
  } else if (button.dataset.previewAction === 'vending-reset') {
    fallbackVending.reset();
    previewVendingState = 'idle';
    if (studioScene) studioScene.resetVending();
    else $('#scene-feedback').textContent = 'Vending machine reset. All products are available.';
    renderSceneActions(activeProblem());
  } else if (button.dataset.floor) {
    const floor = Number(button.dataset.floor);
    requestedFloor = floor;
    if (studioScene) studioScene.requestElevatorFloor(floor);
    else $('#scene-feedback').textContent = `Elevator requested at floor ${floor}.`;
    renderSceneActions(activeProblem());
  }
});

document.addEventListener('keydown', (event) => {
  const modifier = event.metaKey || event.ctrlKey;
  if (!modifier) return;
  const key = event.key.toLowerCase();
  if (key === 's' && !event.shiftKey) {
    event.preventDefault();
    state.drafts[activeId] = collectDraft();
    announce(save() ? 'Draft saved in this browser.' : 'Could not save. Your draft remains in this session.');
  } else if (key === 'enter' && !event.shiftKey) {
    event.preventDefault();
    $('#workspace-form').requestSubmit();
  } else if (key === 'p' && event.shiftKey) {
    event.preventDefault();
    openPresentation();
  }
});

renderProblem();
document.documentElement.classList.add('motion-ready');
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 }) : null;
document.querySelectorAll('.challenge-gallery-section, .gallery-card, .concept-marquee, .brief-card, .design-card, .review-card, .revision-card, .history-card, .page-footer').forEach((element) => {
  element.classList.add('scroll-reveal');
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add('is-revealed');
});
const updateScrollProgress = () => {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty('--scroll-progress', `${range > 0 ? window.scrollY / range * 100 : 0}%`);
};
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();
if ('IntersectionObserver' in window) {
  const sceneObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      ensureScene();
      sceneObserver.disconnect();
    }
  }, { rootMargin: '100px' });
  sceneObserver.observe($('#scene-stage'));
} else ensureScene();
