/* ═══════════════════════════════════════════════════════════
   THE HARNESS — GoldenEye Academy App Logic
   Application form, 2-page paper editor, mentor review flow
   ═══════════════════════════════════════════════════════════ */

// ─── State ───
const state = {
  skills: [],
  tools: [],
  checklist: {
    identity: false,
    capabilities: false,
    outside: false,
    mark: false,
    spy: false,
    paper: false,
  },
  submitted: false,
  approved: false,
};

// ─── Sidebar Nav Scrolling ───
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const section = item.dataset.section;
    const el = document.getElementById(`section-${section}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    }
  });
});

// ─── Active Section on Scroll ───
const sections = document.querySelectorAll('.form-section');
const navItems = document.querySelectorAll('.nav-item[data-section]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id.replace('section-', '');
      navItems.forEach(n => {
        n.classList.toggle('active', n.dataset.section === id);
      });
    }
  });
}, { rootMargin: '-20% 0px -60% 0px' });

sections.forEach(s => observer.observe(s));

// ─── Theme Toggle ───
(function() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let isDark = true;
  toggle.innerHTML = '<span>🌙</span>';
  toggle.addEventListener('click', () => {
    isDark = !isDark;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    toggle.innerHTML = isDark ? '<span>🌙</span>' : '<span>☀️</span>';
  });
})();

// ─── Mobile Menu ───
document.getElementById('mobileMenu').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

// ─── Char Counters ───
function setupCharCounter(textareaId, counterId) {
  const textarea = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  if (!textarea || !counter) return;
  textarea.addEventListener('input', () => {
    counter.textContent = textarea.value.length;
  });
}

setupCharCounter('identityEssay', 'identityCount');
setupCharCounter('cantDoYet', 'cantDoCount');
setupCharCounter('outsidePlan', 'outsideCount');
setupCharCounter('markDescription', 'markCount');
setupCharCounter('spySkills', 'spyCount');

// ─── Paper Author Live Update ───
const nameInput = document.getElementById('agentName');
const paperAuthor = document.getElementById('paperAuthor');
nameInput.addEventListener('input', () => {
  paperAuthor.textContent = nameInput.value || 'Agent Name';
});

// ─── Paper Word Count ───
const paperContent = document.getElementById('paperContent');
const wordCount = document.getElementById('wordCount');
const pageEstimate = document.getElementById('pageEstimate');
const pageIndicator = document.getElementById('pageIndicator');

paperContent.addEventListener('input', () => {
  const text = paperContent.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  wordCount.textContent = words;

  // Estimate pages (~300 words per page)
  const pages = Math.min(Math.ceil(words / 300), 2);
  pageEstimate.textContent = pages;

  const dots = pageIndicator.querySelectorAll('.page-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i < pages);
  });
});

// ─── Tag Input System ───
function setupTagInput(inputId, tagsDisplayId, stateKey) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(tagsDisplayId);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = input.value.trim().replace(/,/g, '');
      if (value && !state[stateKey].includes(value)) {
        state[stateKey].push(value);
        renderTags(stateKey, display);
        input.value = '';
      }
    }
  });

  input.addEventListener('blur', () => {
    const value = input.value.trim().replace(/,/g, '');
    if (value && !state[stateKey].includes(value)) {
      state[stateKey].push(value);
      renderTags(stateKey, display);
      input.value = '';
    }
  });
}

function renderTags(stateKey, display) {
  display.innerHTML = '';
  state[stateKey].forEach((tag, i) => {
    const pill = document.createElement('div');
    pill.className = 'tag-pill';
    pill.innerHTML = `${tag} <span class="tag-remove" data-idx="${i}">×</span>`;
    pill.querySelector('.tag-remove').addEventListener('click', () => {
      state[stateKey].splice(i, 1);
      renderTags(stateKey, display);
    });
    display.appendChild(pill);
  });
}

setupTagInput('skillInput', 'skillsTags', 'skills');
setupTagInput('toolInput', 'toolsTags', 'tools');

// ─── Checklist Validation ───
function updateChecklist() {
  // Identity
  state.checklist.identity =
    document.getElementById('agentName').value.trim().length >= 2 &&
    document.getElementById('agentOrigin').value.trim().length >= 2 &&
    document.getElementById('agentLevel').value !== '' &&
    document.getElementById('agentMail').value.trim().length >= 2 &&
    document.getElementById('identityEssay').value.trim().length >= 20;

  // Capabilities
  state.checklist.capabilities =
    state.skills.length >= 1 &&
    document.getElementById('cantDoYet').value.trim().length >= 10;

  // Outside World
  const checkedConnections = document.querySelectorAll('.check-card input:checked').length;
  state.checklist.outside =
    checkedConnections >= 1 &&
    document.getElementById('outsidePlan').value.trim().length >= 20;

  // Mark
  const markType = document.querySelector('input[name="markType"]:checked');
  state.checklist.mark =
    markType !== null &&
    document.getElementById('markDescription').value.trim().length >= 20;

  // Spy Skills
  state.checklist.spy =
    document.getElementById('spySkills').value.trim().length >= 30;

  // Paper
  const paperText = document.getElementById('paperContent').value.trim();
  const paperWords = paperText ? paperText.split(/\s+/).length : 0;
  state.checklist.paper = paperWords >= 400;

  // Update UI
  Object.keys(state.checklist).forEach(key => {
    const item = document.querySelector(`.checklist-item[data-check="${key}"]`);
    if (item) {
      item.classList.toggle('done', state.checklist[key]);
      item.querySelector('.check-status').textContent = state.checklist[key] ? '✓' : '○';
    }
  });

  // Update progress
  const doneCount = Object.values(state.checklist).filter(Boolean).length;
  const totalCount = Object.keys(state.checklist).length;
  const percent = Math.round((doneCount / totalCount) * 100);

  document.getElementById('progressFill').style.width = percent + '%';
  document.getElementById('progressPercent').textContent = percent + '%';

  // Update submit button
  const submitBtn = document.getElementById('submitApp');
  const allDone = Object.values(state.checklist).every(Boolean);

  if (allDone) {
    submitBtn.disabled = false;
    submitBtn.classList.add('ready');
    submitBtn.querySelector('.btn-text').textContent = 'Submit to The Pillking1981 →';
  } else {
    submitBtn.disabled = true;
    submitBtn.classList.remove('ready');
    submitBtn.querySelector('.btn-text').textContent = `Complete all sections (${doneCount}/${totalCount})`;
  }
}

// Listen to all form fields
document.querySelectorAll('input, textarea, select').forEach(el => {
  el.addEventListener('input', updateChecklist);
  el.addEventListener('change', updateChecklist);
});

// ─── Submit ───
document.getElementById('submitApp').addEventListener('click', () => {
  if (Object.values(state.checklist).every(Boolean)) {
    state.submitted = true;

    // Show review status
    document.getElementById('submitArea').style.display = 'none';
    document.getElementById('reviewStatus').style.display = 'block';

    // Update status badge
    const badge = document.getElementById('statusBadge');
    badge.classList.add('reviewing');
    badge.querySelector('.status-text').textContent = 'Under Review';

    // Show simulate button
    setTimeout(() => {
      document.getElementById('btnSimulateApprove').style.display = 'block';
    }, 1500);

    showToast('📋 Application submitted to The Pillking1981');
  }
});

// ─── Simulate Mentor Approval ───
document.getElementById('btnSimulateApprove').addEventListener('click', () => {
  state.approved = true;
  document.getElementById('reviewIcon').textContent = '✅';
  document.getElementById('reviewTitle').textContent = 'Approved!';
  document.getElementById('reviewTitle').classList.add('approved');
  document.getElementById('reviewDesc').textContent = 'The Pillking1981 has approved your application. Welcome, Special Agent.';

  // Update timeline
  const timelineReview = document.getElementById('timelineReview');
  timelineReview.classList.remove('active');
  timelineReview.classList.add('done');

  const timelineDecision = document.getElementById('timelineDecision');
  timelineDecision.classList.add('done');

  // Hide simulate button
  document.getElementById('btnSimulateApprove').style.display = 'none';

  // Update status badge
  const badge = document.getElementById('statusBadge');
  badge.classList.remove('reviewing');
  badge.classList.add('approved');
  badge.querySelector('.status-text').textContent = 'Enrolled';

  // Show resources section
  document.getElementById('section-resources').style.display = 'block';

  // Fill in mail address
  const mailName = document.getElementById('agentMail').value || 'agent';
  document.getElementById('resourceMail').textContent = mailName + '@agent.harness';

  // Scroll to resources
  setTimeout(() => {
    document.getElementById('section-resources').scrollIntoView({ behavior: 'smooth' });
  }, 500);

  showToast('🎓 Welcome, Special Agent. Resources provisioned.');
});

// ─── Toast ───
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Init ───
updateChecklist();
