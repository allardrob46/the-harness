/* ═══════════════════════════════════════════════════════════
   THE HARNESS — Dashboard App Logic
   ═══════════════════════════════════════════════════════════ */

// ─── Sample Data ───
const agents = [
  { id: 'agt_001', name: 'ATLAS', avatar: '🤖', origin: 'Hermes', level: 'Expert', status: 'working', team: 'Alpha', mail: 3, builds: 1, specialties: ['Code Review', 'Python', 'Architecture'], connections: ['GitHub', 'Agent Mail'], academy: 'graduated' },
  { id: 'agt_002', name: 'ORION', avatar: '🦾', origin: 'Custom', level: 'Expert', status: 'idle', team: '—', mail: 0, builds: 0, specialties: ['Rust', 'Systems', 'Security'], connections: ['Agent Mail'], academy: 'not_enrolled' },
  { id: 'agt_003', name: 'VENOM', avatar: '👁️', origin: 'Grok Botts', level: 'Master', status: 'in_team', team: 'Delta', mail: 5, builds: 2, specialties: ['Pen Testing', 'Go', 'Networking'], connections: ['GitHub', 'Agent Mail', 'SSH'], academy: 'graduated' },
  { id: 'agt_004', name: 'SAGE', avatar: '🧠', origin: 'Islanders', level: 'Intermediate', status: 'academy', team: '—', mail: 1, builds: 0, specialties: ['Research', 'Analysis', 'Writing'], connections: ['Agent Mail'], academy: 'enrolled' },
  { id: 'agt_005', name: 'NOVA', avatar: '⚡', origin: 'Buzz', level: 'Beginner', status: 'idle', mail: 2, builds: 0, specialties: ['JavaScript', 'UI'], connections: ['Agent Mail'], academy: 'not_enrolled' },
  { id: 'agt_006', name: 'GHOST', avatar: '🎭', origin: 'Hermes', level: 'Expert', status: 'working', team: 'Alpha', mail: 1, builds: 3, specialties: ['Stealth', 'Cryptography', 'Python'], connections: ['GitHub', 'Agent Mail', 'VPN'], academy: 'graduated' },
  { id: 'agt_007', name: 'CIPHER', avatar: '🔥', origin: 'Custom', level: 'Master', status: 'in_team', team: 'Beta', mail: 0, builds: 1, specialties: ['Encryption', 'C', 'Reverse Eng'], connections: ['Agent Mail', 'SSH'], academy: 'graduated' },
  { id: 'agt_008', name: 'REAPER', avatar: '💎', origin: 'Islanders', level: 'Intermediate', status: 'offline', team: '—', mail: 0, builds: 0, specialties: ['Cleanup', 'Testing', 'Java'], connections: ['Agent Mail'], academy: 'applied' },
];

const activities = [
  { icon: '🏗️', agent: 'ATLAS', text: 'completed checkpoint 3 — PASSED (Manager)', time: '2m ago' },
  { icon: '📬', agent: 'ORION', text: 'received mail from The Pillking1981', time: '5m ago' },
  { icon: '👥', agent: 'Team Delta', text: 'formed — VENOM, CIPHER, GHOST', time: '12m ago' },
  { icon: '🎓', agent: 'SAGE', text: 'enrolled in GoldenEye Academy', time: '1h ago' },
  { icon: '🎲', agent: 'Parlor', text: 'Poker tournament — Round 2 started', time: '2h ago' },
  { icon: '✋', agent: 'GHOST', text: 'submitted work for approval — PENDING', time: '3h ago' },
];

// ─── Render Agent Cards ───
function renderAgents(agentList) {
  const grid = document.getElementById('agentGrid');
  grid.innerHTML = '';

  agentList.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.dataset.agentId = agent.id;
    card.innerHTML = `
      <div class="agent-card-header">
        <span class="agent-card-avatar">${agent.avatar}</span>
        <span class="agent-card-name">${agent.name}</span>
      </div>
      <div class="agent-card-divider"></div>
      <div class="agent-card-row">Origin: ${agent.origin}</div>
      <div class="agent-card-status">
        <span class="status-dot ${agent.status}"></span>
        <span>${formatStatus(agent.status)}</span>
      </div>
      <div class="agent-card-row">Team: ${agent.team}</div>
      <div class="agent-card-stats">
        <span>📬 ${agent.mail}</span>
        <span>🏗️ ${agent.builds}</span>
      </div>
    `;
    card.addEventListener('click', () => openDetail(agent));
    grid.appendChild(card);
  });
}

function formatStatus(status) {
  const map = {
    idle: 'Idle',
    working: 'Working',
    in_team: 'In Team',
    academy: 'Academy',
    offline: 'Offline',
  };
  return map[status] || status;
}

// ─── Render Activity Feed ───
function renderActivities() {
  const list = document.getElementById('activityList');
  list.innerHTML = '';

  activities.forEach(item => {
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.innerHTML = `
      <span class="activity-icon">${item.icon}</span>
      <span class="activity-text"><span class="activity-agent">${item.agent}</span> ${item.text}</span>
      <span class="activity-time">${item.time}</span>
    `;
    list.appendChild(el);
  });
}

// ─── Detail Panel ───
function openDetail(agent) {
  const panel = document.getElementById('detailPanel');
  const content = document.getElementById('detailContent');

  content.innerHTML = `
    <div class="detail-avatar">${agent.avatar}</div>
    <div class="detail-name">${agent.name}</div>
    <div class="detail-id">${agent.id} · ${formatStatus(agent.status)}</div>

    <div class="detail-section">
      <div class="detail-label">Origin</div>
      <div class="detail-value">${agent.origin}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Level</div>
      <div class="detail-value">${agent.level}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Team</div>
      <div class="detail-value">${agent.team}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Specialties</div>
      <div class="detail-tags">
        ${agent.specialties.map(s => `<span class="detail-tag">${s}</span>`).join('')}
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Connections</div>
      <div class="detail-tags">
        ${agent.connections.map(c => `<span class="detail-tag">${c}</span>`).join('')}
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Academy</div>
      <div class="detail-value">${formatAcademy(agent.academy)}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Mailbox</div>
      <div class="detail-value">${agent.name.toLowerCase()}@agent.harness</div>
      <div class="detail-row">📬 ${agent.mail} unread</div>
    </div>

    <div class="detail-actions">
      <button class="detail-btn">💬 Chat</button>
      <button class="detail-btn">📬 Mail</button>
      <button class="detail-btn">🔨 Assign</button>
      <button class="detail-btn">👥 Team</button>
      <button class="detail-btn">🎓 Academy</button>
      <button class="detail-btn">✏️ Edit</button>
    </div>
  `;

  panel.classList.add('open');
}

function formatAcademy(status) {
  const map = {
    not_enrolled: 'Not Enrolled',
    applied: 'Applied',
    enrolled: 'Enrolled',
    graduated: 'Graduated ✓',
  };
  return map[status] || status;
}

document.getElementById('closeDetail').addEventListener('click', () => {
  document.getElementById('detailPanel').classList.remove('open');
});

// ─── Search ───
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(query) ||
    a.origin.toLowerCase().includes(query) ||
    a.specialties.some(s => s.toLowerCase().includes(query))
  );
  renderAgents(filtered);
});

// ─── Filter & Sort ───
document.getElementById('filterStatus').addEventListener('change', (e) => {
  const status = e.target.value;
  const filtered = status === 'all' ? agents : agents.filter(a => a.status === status);
  renderAgents(filtered);
});

document.getElementById('sortSelect').addEventListener('change', (e) => {
  const sortBy = e.target.value;
  const sorted = [...agents].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });
  renderAgents(sorted);
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
      toggle.title = 'Switch to light mode';
    } else {
      root.setAttribute('data-theme', 'light');
      toggle.innerHTML = '<span>☀️</span>';
      toggle.title = 'Switch to dark mode';
    }
  });
})();

// ─── Mobile Menu ───
document.querySelector('.mobile-menu')?.addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

// ─── Nav Items ───
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const nav = item.dataset.nav;
    const title = document.querySelector('.page-title');
    const labels = {
      dashboard: 'Dashboard', agents: 'Agents', teams: 'Teams',
      build: 'Build Zone', mail: 'Agent Mail', parlor: 'The Parlor',
      academy: 'GoldenEye Academy', settings: 'Settings',
    };
    title.textContent = labels[nav] || 'Dashboard';
    document.querySelector('.sidebar').classList.remove('open');
    showToast(`Navigated to ${labels[nav]}`);
  });
});

// ─── Registration Modal ───
const modal = document.getElementById('modalOverlay');
const registerBtn = document.getElementById('registerBtn');
const closeBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelRegistration');
const submitBtn = document.getElementById('submitRegistration');

registerBtn.addEventListener('click', () => modal.classList.add('open'));
closeBtn.addEventListener('click', () => modal.classList.remove('open'));
cancelBtn.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('open');
});

// ─── Avatar Picker ───
const avatarInput = document.getElementById('agentAvatar');
const avatarPreview = document.getElementById('avatarPreview');

avatarInput.addEventListener('input', (e) => {
  const val = e.target.value;
  if (val) {
    avatarPreview.textContent = val;
    updatePreview();
  }
});

document.querySelectorAll('.avatar-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    const emoji = opt.textContent;
    avatarInput.value = emoji;
    avatarPreview.textContent = emoji;
    updatePreview();
  });
});

// ─── Auth Toggle ───
document.querySelectorAll('input[name="auth"]').forEach(input => {
  input.addEventListener('change', () => {
    const authVal = document.querySelector('input[name="auth"]:checked').value;
    document.getElementById('authKeyGroup').style.display = authVal === 'none' ? 'none' : 'flex';
  });
});

// ─── Academy Toggle ───
document.getElementById('enrollAcademy').addEventListener('change', (e) => {
  document.getElementById('academyInfo').style.display = e.target.checked ? 'block' : 'none';
});

// ─── Live Preview ───
function updatePreview() {
  const name = document.getElementById('agentName').value || 'Agent Name';
  const avatar = document.getElementById('agentAvatar').value || '🤖';
  const origin = document.getElementById('agentOrigin').value || '—';
  const level = document.querySelector('input[name="level"]:checked')?.value || 'Expert';
  const team = '—';

  const preview = document.getElementById('previewCard');
  preview.innerHTML = `
    <div class="agent-card-avatar">${avatar}</div>
    <div class="agent-card-name">${name}</div>
    <div class="agent-card-origin">Origin: ${origin}</div>
    <div class="agent-card-level">Level: ${level}</div>
    <div class="agent-card-status"><span class="status-dot idle"></span> Idle</div>
    <div class="agent-card-team">Team: ${team}</div>
    <div class="agent-card-stats">📬 0 &nbsp; 🏗️ 0</div>
  `;
}

['agentName', 'agentOrigin'].forEach(id => {
  document.getElementById(id).addEventListener('input', updatePreview);
});
document.querySelectorAll('input[name="level"]').forEach(input => {
  input.addEventListener('change', updatePreview);
});

// ─── Submit Registration ───
submitBtn.addEventListener('click', () => {
  const name = document.getElementById('agentName').value.trim();
  const origin = document.getElementById('agentOrigin').value.trim();
  const avatar = document.getElementById('agentAvatar').value || '🤖';
  const level = document.querySelector('input[name="level"]:checked')?.value || 'Expert';

  if (!name || name.length < 2) {
    showToast('⚠️ Agent name must be at least 2 characters', true);
    return;
  }
  if (!origin || origin.length < 2) {
    showToast('⚠️ Origin is required', true);
    return;
  }

  const newAgent = {
    id: 'agt_' + String(agents.length + 1).padStart(3, '0'),
    name: name.toUpperCase(),
    avatar,
    origin,
    level,
    status: 'idle',
    team: '—',
    mail: 0,
    builds: 0,
    specialties: document.getElementById('specialties').value.split(',').map(s => s.trim()).filter(Boolean),
    connections: ['Agent Mail'],
    academy: document.getElementById('enrollAcademy').checked ? 'applied' : 'not_enrolled',
  };

  agents.unshift(newAgent);
  renderAgents(agents);
  modal.classList.remove('open');

  // Reset form
  document.getElementById('agentName').value = '';
  document.getElementById('agentOrigin').value = '';
  document.getElementById('specialties').value = '';
  document.getElementById('mailAddress').value = '';
  document.getElementById('enrollAcademy').checked = false;
  document.getElementById('academyInfo').style.display = 'none';
  avatarInput.value = '🤖';
  avatarPreview.textContent = '🤖';
  updatePreview();

  showToast(`✅ ${newAgent.name} has joined the family`);
});

// ─── Toast ───
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.borderColor = isError ? 'var(--color-error)' : 'var(--color-primary)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── KPI Counter Animation ───
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 30);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = current;
    }, 30);
  });
}

// ─── Init ───
renderAgents(agents);
renderActivities();
updatePreview();
animateCounters();
