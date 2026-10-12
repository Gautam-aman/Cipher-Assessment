import { problems } from './problems.js';
import { evaluateSubmission, validateSubmission } from './evaluation.js';
import { loadState, saveState } from './storage.js';

const state = loadState();
let activeId = problems[0].id;
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

function renderProblems() {
  $('#problem-list').innerHTML = problems.map((problem) => {
    const attempts = state.attempts.filter((item) => item.problemId === problem.id).length;
    const key = problem.id === 'elevator' ? 'elevator' : problem.id;
    return `<button class="problem-card ${activeId === problem.id ? 'selected' : ''}" data-problem="${problem.id}" aria-label="${esc(problem.title)}, ${esc(problem.level)}, ${problem.minutes} minute challenge, ${attempts} previous attempts" aria-pressed="${activeId === problem.id}">
      <span class="mission-icon mission-icon-${key}">${challengeIcons[key]}</span><span class="mission-content"><span class="mission-title-row"><strong>${esc(problem.title)}</strong><span class="mission-status ${attempts ? 'practiced' : ''}">${attempts ? `${attempts} ${attempts === 1 ? 'TRY' : 'TRIES'}` : 'NEW'}</span></span><small>${esc(problem.category)}</small><span class="mission-meta"><span>${esc(problem.level)}</span><i>·</i><span>${problem.minutes} MIN</span></span></span><span class="mission-arrow">↗</span></button>`;
  }).join('');
}

function renderProblem() {
  const problem = activeProblem();
  $('#problem-level').textContent = problem.level;
  $('#problem-title').textContent = problem.title;
  $('#problem-summary').textContent = problem.summary;
  $('#problem-time').textContent = `${problem.minutes} MIN ESTIMATE`;
  $('#requirements').innerHTML = problem.requirements.map((item) => `<li>${esc(item)}</li>`).join('');
  $('#extension-prompt').textContent = problem.extension;
  for (const field of ['requirements', 'classes', 'relationships', 'tradeoffs']) $(`#${field}-input`).value = draftFor()[field] ?? '';
  updateDraftProgress(draftFor());
  setPracticeStep(Object.values(draftFor()).some((value) => String(value).trim()) ? 'design' : 'choose');
  $('#draft-status').textContent = Object.values(draftFor()).some((value) => String(value).trim()) ? 'DRAFT IN PROGRESS' : 'READY TO DESIGN';
  $('#field-count').textContent = `${state.attempts.filter((item) => item.problemId === activeId).length} previous ${state.attempts.some((item) => item.problemId === activeId) ? 'attempts' : 'attempts so far'}`;
  renderEmptyReview();
  renderProblems();
  renderHistory();
}

function renderHistory() {
  const attempts = state.attempts.filter((item) => item.problemId === activeId).slice().reverse();
  $('#history-list').innerHTML = attempts.length ? attempts.slice(0, 5).map((attempt, i) => `<button class="history-item" data-attempt="${esc(attempt.id)}"><span class="history-dot"></span><span class="history-main"><strong>Attempt ${attempt.number}</strong><small>${new Date(attempt.createdAt).toLocaleString()}</small></span><span class="history-score">${attempt.evaluation.score}<small>/100</small></span></button>`).join('') : `<div class="history-empty">No attempts yet. Your first design starts the learning loop.</div>`;
  $('#clear-history').disabled = attempts.length === 0;
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

function renderEmptyReview() {
  $('#feedback-panel').innerHTML = `<div class="feedback-empty"><div class="empty-icon">↗</div><strong>Your review takes shape here</strong><p>Submit a design to get a clear, evidence-based review across six dimensions.</p><span class="review-empty-tag">NO SUBMISSION YET</span></div>`;
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
  activeId = button.dataset.problem;
  renderProblem();
});

$('#workspace-form').addEventListener('input', () => {
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
  const attempt = { id: crypto.randomUUID(), problemId: activeId, number, createdAt: new Date().toISOString(), submission: draft, status: 'completed', evaluation };
  state.attempts.push(attempt);
  delete state.drafts[activeId];
  const persisted = save();
  renderFeedback(evaluation);
  setPracticeStep('reflect');
  renderProblemFieldsReset();
  renderProblems();
  renderHistory();
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
  renderFeedback(attempt.evaluation);
  setPracticeStep('reflect');
  $('#draft-status').textContent = `VIEWING ATTEMPT ${attempt.number}`;
});

$('#new-attempt').addEventListener('click', () => {
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
  save();
  renderProblems();
  renderHistory();
  announce('Attempt history cleared.');
});

$('#sidebar-toggle').addEventListener('click', (event) => {
  const collapsed = document.querySelector('.shell').classList.toggle('sidebar-collapsed');
  event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
  event.currentTarget.setAttribute('aria-label', collapsed ? 'Expand challenge navigation' : 'Collapse challenge navigation');
  event.currentTarget.title = collapsed ? 'Expand navigation' : 'Collapse navigation';
});

renderProblem();
