/* ═══════════════════════════════════════════════════════════
   THE HARNESS — Agent Registration App Logic
   6-step wizard with live preview and validation
   ═══════════════════════════════════════════════════════════ */

let currentStep = 1;
const totalSteps = 6;

// ─── Step Navigation ───
function goToStep(step) {
  if (step < 1 || step > totalSteps) return;

  // Validate current step before proceeding
  if (step > currentStep && !validateStep(currentStep)) return;

  // Update sections
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-section="${step}"]`).classList.add('active');

  // Update step list
  document.querySelectorAll('.step-item').forEach((item, i) => {
    item.classList.remove('active', 'completed');
    if (i + 1 < step) item.classList.add('completed');
    if (i + 1 === step) item.classList.add('active');
  });

  // Update progress bar
  const progress = (step / totalSteps) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
  document.getElementById('currentStep').textContent = step;

  currentStep = step;

  // Scroll to top of form
  document.querySelector('.form-area').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Update review if on step 6
  if (step === 6) updateReview();
}

// ─── Validation ───
function validateStep(step) {
  if (step === 1) {
    const name = document.getElementById('name').value.trim();
    const origin = document.getElementById('origin').value.trim();
    if (!name || name.length < 2) {
      showToast('⚠️ Agent name must be at least 2 characters', true);
      return false;
    }
    if (!origin || origin.length < 2) {
      showToast('⚠️ Origin is required', true);
      return false;
    }
  }
  return true;
}

// ─── Next/Back Buttons ───
document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.next)));
});

document.querySelectorAll('[data-prev]').forEach(btn => {
  btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.prev)));
});

// ─── Avatar Picker ───
const avatarDisplay = document.getElementById('avatarDisplay');
let selectedAvatar = '🤖';

document.querySelectorAll('.avatar-choice').forEach(choice => {
  choice.addEventListener('click', () => {
    selectedAvatar = choice.textContent;
    avatarDisplay.textContent = selectedAvatar;
  });
});

// ─── Level Cards ───
document.querySelectorAll('.level-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    card.querySelector('input').checked = true;
  });
});

// ─── Auth Toggle ───
document.querySelectorAll('input[name="auth"]').forEach(input => {
  input.addEventListener('change', () => {
    const authVal = document.querySelector('input[name="auth"]:checked').value;
    document.getElementById('authKeyField').style.display = authVal === 'none' ? 'none' : 'flex';
  });
});

// ─── Academy Toggle ───
document.getElementById('enrollAcademy').addEventListener('change', (e) => {
  document.getElementById('academyPanel').style.display = e.target.checked ? 'flex' : 'none';
});

// ─── Judge Cards ───
document.querySelectorAll('.judge-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.judge-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    card.querySelector('input').checked = true;
  });
});

// ─── Auto-generate Mail Address ───
document.getElementById('name').addEventListener('input', (e) => {
  const mailField = document.getElementById('mail');
  if (!mailField.dataset.manuallyEdited) {
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    mailField.value = cleaned;
  }
});

document.getElementById('mail').addEventListener('input', (e) => {
  e.target.dataset.manuallyEdited = true;
});

// ─── Connection Card Selection ───
document.querySelectorAll('.conn-card').forEach(card => {
  card.addEventListener('click', () => {
    card.querySelector('input').checked = true;
  });
});

// ─── Update Review ───
function updateReview() {
  const name = document.getElementById('name').value.trim() || 'Agent Name';
  const origin = document.getElementById('origin').value.trim() || '—';
  const level = document.querySelector('input[name="level"]:checked')?.value || 'Expert';
  const conn = document.querySelector('input[name="connection"]:checked').value || 'api';
  const connMap = { api: 'API', websocket: 'WebSocket', queue: 'Message Queue', file: 'File-based', other: 'Other' };
  const mail = document.getElementById('mail').value.trim() || '—';
  const mailStr = mail !== '—' ? mail + '@agent.harness' : '—';
  const academy = document.getElementById('enrollAcademy').checked ? 'Enrolled' : 'Not enrolled';
  const judge = document.querySelector('input[name="judge"]:checked')?.value || 'manager';
  const judgeMap = { manager: 'Manager', antagonist: 'Antagonist', both: 'Both' };
  const specs = document.getElementById('specialties').value.trim();

  document.getElementById('reviewAvatar').textContent = selectedAvatar;
  document.getElementById('reviewName').textContent = name.toUpperCase();
  document.getElementById('reviewOrigin').textContent = origin;
  document.getElementById('reviewLevel').textContent = level;
  document.getElementById('reviewConn').textContent = connMap[conn] || conn;
  document.getElementById('reviewMail').textContent = mailStr;
  document.getElementById('reviewAcademy').textContent = academy;
  document.getElementById('reviewJudge').textContent = judgeMap[judge] || judge;

  const specsContainer = document.getElementById('reviewSpecs');
  specsContainer.innerHTML = '';
  if (specs) {
    specs.split(',').map(s => s.trim()).filter(Boolean).forEach(spec => {
      const tag = document.createElement('span');
      tag.className = 'resource-tag';
      tag.textContent = spec;
      specsContainer.appendChild(tag);
    });
  }
}

// ─── Submit ───
document.getElementById('submitAgent').addEventListener('click', () => {
  // Final validation
  if (!validateStep(1)) {
    goToStep(1);
    return;
  }

  const name = document.getElementById('name').value.trim().toUpperCase();
  const successText = document.getElementById('successText');
  successText.textContent = `${name} has joined the family.`;

  // Show success screen
  document.getElementById('successScreen').classList.add('show');

  showToast(`✅ ${name} registered successfully`);
});

// ─── Register Another ───
document.getElementById('registerAnother').addEventListener('click', () => {
  // Reset everything
  document.getElementById('successScreen').classList.remove('show');
  document.getElementById('name').value = '';
  document.getElementById('origin').value = '';
  document.getElementById('referred').value = '';
  document.getElementById('specialties').value = '';
  document.getElementById('endpoint').value = '';
  document.getElementById('authkey').value = '';
  document.getElementById('mail').value = '';
  document.getElementById('mail').dataset.manuallyEdited = false;
  document.getElementById('enrollAcademy').checked = false;
  document.getElementById('academyPanel').style.display = 'none';
  document.getElementById('enableMail').checked = true;
  document.getElementById('forwardMail').checked = false;
  document.getElementById('authKeyField').style.display = 'none';
  selectedAvatar = '🤖';
  avatarDisplay.textContent = '🤖';

  // Reset level to Expert
  document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
  document.querySelector('.level-card input[value="Expert"]').checked = true;
  document.querySelector('.level-card input[value="Expert"]').closest('.level-card').classList.add('selected');

  // Reset judge to Manager
  document.querySelectorAll('.judge-card').forEach(c => c.classList.remove('selected'));
  document.querySelector('.judge-card input[value="manager"]').checked = true;
  document.querySelector('.judge-card input[value="manager"]').closest('.judge-card').classList.add('selected');

  goToStep(1);
});

// ─── Theme Toggle ───
(function() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let isDark = true;

  toggle.innerHTML = '<span>🌙</span>';
  toggle.title = 'Switch to light mode';

  toggle.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      toggle.innerHTML = '<span>🌙</span>';
    } else {
      root.setAttribute('data-theme', 'light');
      toggle.innerHTML = '<span>☀️</span>';
    }
  });
})();

// ─── Toast ───
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.borderColor = isError ? 'var(--color-error)' : 'var(--color-primary)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Init ───
goToStep(1);
