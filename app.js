/**
 * AEGISEDU AI — AUTONOMOUS ACADEMIC INTELLIGENCE PLATFORM (AG002)
 * Client-Side Controller & Interactive Neural Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. Role Definitions & Presets (RBAC Governance)
  // ------------------------------------------------------------------------
  const ROLE_CONFIGS = {
    admin: {
      id: 'admin',
      name: 'Administrator',
      email: 'admin@aegisedu.ac.in',
      pass: 'AutonomousAdmin@2026!',
      icon: '🛡️',
      clearance: 'CLEARANCE: LEVEL 5 (SUPERUSER)',
      title: 'Administrator Access',
      desc: 'Full governance: Global Digital Twin engine, system-wide optimization constraints, audit trail oversight, and RBAC policy control.',
      welcomeName: 'Dr. Alan Turing — Vice Chancellor Office',
      roleTag: 'Chief Academic Operations Administrator',
      stats: [
        { num: '148', title: 'Classrooms Synced' },
        { num: '99.8%', title: 'Conflict-Free Rate' },
        { num: '0', title: 'Pending Violations' }
      ],
      actions: [
        { label: 'Launch Master Timetable Optimizer', icon: '⚡' },
        { label: 'Simulate Digital Twin Scenario (Monsoon / Emergency)', icon: '🔮' },
        { label: 'Inspect Security Audit Log & Anomaly Sentinel', icon: '🛡️' }
      ],
      requiresMfa: true
    },
    hod: {
      id: 'hod',
      name: 'HOD',
      email: 'hod.cse@aegisedu.ac.in',
      pass: 'HodOperations@2026!',
      icon: '🏛️',
      clearance: 'CLEARANCE: LEVEL 4 (DEPARTMENTAL)',
      title: 'Head of Department (Computer Science)',
      desc: 'Departmental timetable approvals, faculty workload variance regulation, laboratory allocation, and leave substitution sign-offs.',
      welcomeName: 'Prof. Margaret Hamilton — HOD CSE',
      roleTag: 'Department Head & Academic Council Member',
      stats: [
        { num: '38', title: 'Dept Faculty' },
        { num: '18.2 h', title: 'Avg Workload' },
        { num: '3', title: 'Leave Approvals Due' }
      ],
      actions: [
        { label: 'Review CSE Department Smart Timetable', icon: '📅' },
        { label: 'Approve AI-Matched Faculty Substitutions', icon: '✅' },
        { label: 'Adjust Lab Hardware Allocation Matrix', icon: '⚙️' }
      ],
      requiresMfa: false
    },
    faculty: {
      id: 'faculty',
      name: 'Faculty',
      email: 'dr.elena.vance@aegisedu.ac.in',
      pass: 'FacultyToken@2026!',
      icon: '👨‍🏫',
      clearance: 'CLEARANCE: LEVEL 3 (INSTRUCTIONAL)',
      title: 'Faculty Member Clearance',
      desc: 'Personalized schedule, automated leave substitution recommender, workload equity tracking, and room change requests.',
      welcomeName: 'Dr. Elena Vance — Associate Professor',
      roleTag: 'Faculty of Computer Science & Engineering',
      stats: [
        { num: '16 h', title: 'Weekly Lectures' },
        { num: '4', title: 'Active Courses' },
        { num: '0', title: 'Overtime Clashes' }
      ],
      actions: [
        { label: 'View Dynamic Weekly Schedule & Venues', icon: '🗓️' },
        { label: 'Apply Leave with AI Auto-Substitution Match', icon: '🏖️' },
        { label: 'Request Peer Class Swap / Extra Lab Slot', icon: '🔄' }
      ],
      requiresMfa: false
    },
    student: {
      id: 'student',
      name: 'Student',
      email: 'aarav.sharma22@student.aegisedu.ac.in',
      pass: 'StudentPass@2026!',
      icon: '🎓',
      clearance: 'CLEARANCE: LEVEL 1 (LEARNER)',
      title: 'Student Access Portal',
      desc: 'Real-time timetable updates, instant classroom relocation alerts, examination seating coordinates, and elective collision resolvers.',
      welcomeName: 'Aarav Sharma — Roll: CS22B049',
      roleTag: 'B.Tech Computer Science (Semester 6 - Section B)',
      stats: [
        { num: '24 h', title: 'Class Hours/wk' },
        { num: '100%', title: 'Room Attendance' },
        { num: '1', title: 'Exam in 12 Days' }
      ],
      actions: [
        { label: 'View Today’s Real-time Class Schedule', icon: '📖' },
        { label: 'Download Examination Seating & Hall Ticket', icon: '🎫' },
        { label: 'Resolve Open Elective Scheduling Clash', icon: '🧭' }
      ],
      requiresMfa: false
    },
    exam_cell: {
      id: 'exam_cell',
      name: 'Exam Cell',
      email: 'examcell@aegisedu.ac.in',
      pass: 'ExamGovernor@2026!',
      icon: '📋',
      clearance: 'CLEARANCE: LEVEL 4 (EXAMINATION SECURITY)',
      title: 'Examination Cell Operations',
      desc: 'Autonomous exam scheduling engine, invigilator assignment matrix, hall capacity optimizer, and digital seating twins.',
      welcomeName: 'Dr. Kenneth Stone — Exam Controller',
      roleTag: 'Central Examination & Evaluation Cell',
      stats: [
        { num: '16', title: 'Exam Centers' },
        { num: '1,480', title: 'Seating Capacity' },
        { num: '0', title: 'Student Clashes' }
      ],
      actions: [
        { label: 'Run Autonomous Exam Schedule Synthesizer', icon: '🧮' },
        { label: 'Generate AI Invigilation Workload Matrix', icon: '👥' },
        { label: 'Simulate Hall Seating (Digital Twin)', icon: '🏛️' }
      ],
      requiresMfa: true
    }
  };

  let currentRole = 'admin';

  // ------------------------------------------------------------------------
  // 2. DOM Elements
  // ------------------------------------------------------------------------
  const roleTabs = document.querySelectorAll('.role-tab');
  const roleClearanceBadge = document.getElementById('roleClearanceBadge');
  const roleBannerIcon = document.getElementById('roleBannerIcon');
  const roleBannerTitle = document.getElementById('roleBannerTitle');
  const roleBannerDesc = document.getElementById('roleBannerDesc');

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('userEmail');
  const passwordInput = document.getElementById('userPassword');
  const groupEmail = document.getElementById('groupEmail');
  const groupPassword = document.getElementById('groupPassword');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeIcon = document.getElementById('eyeIcon');
  const submitLoginBtn = document.getElementById('submitLoginBtn');
  const submitBtnText = document.getElementById('submitBtnText');

  const loginCard = document.getElementById('loginCard');
  const portalPreviewCard = document.getElementById('portalPreviewCard');
  const portalLogoutBtn = document.getElementById('portalLogoutBtn');
  const portalAvatar = document.getElementById('portalAvatar');
  const portalWelcomeName = document.getElementById('portalWelcomeName');
  const portalRoleTag = document.getElementById('portalRoleTag');
  const portalQuickStats = document.getElementById('portalQuickStats');
  const portalActionDesc = document.getElementById('portalActionDesc');
  const portalActionButtons = document.getElementById('portalActionButtons');

  // Modals
  const telemetryModal = document.getElementById('telemetryModal');
  const openTelemetryBtn = document.getElementById('openTelemetryBtn');
  const closeTelemetryModalBtn = document.getElementById('closeTelemetryModalBtn');

  const mfaModal = document.getElementById('mfaModal');
  const closeMfaModalBtn = document.getElementById('closeMfaModalBtn');
  const verifyMfaBtn = document.getElementById('verifyMfaBtn');
  const mfaDigits = document.querySelectorAll('.mfa-digit');

  const passkeyBtn = document.getElementById('passkeyBtn');
  const passkeyModal = document.getElementById('passkeyModal');
  const closePasskeyModalBtn = document.getElementById('closePasskeyModalBtn');
  const simulateBiometricTouchBtn = document.getElementById('simulateBiometricTouchBtn');
  const passkeyStatusText = document.getElementById('passkeyStatusText');
  const biometricRing = document.getElementById('biometricRing');

  // SSO Buttons
  const ssoGoogleBtn = document.getElementById('ssoGoogleBtn');
  const ssoMicrosoftBtn = document.getElementById('ssoMicrosoftBtn');
  const forgotPassBtn = document.getElementById('forgotPassBtn');

  // Tickers & Clock
  const liveAgentClock = document.getElementById('liveAgentClock');
  const feedStream = document.getElementById('feedStream');
  const toastContainer = document.getElementById('toastContainer');

  // ------------------------------------------------------------------------
  // 3. Role Switcher Functionality
  // ------------------------------------------------------------------------
  function setRole(roleKey, notify = true) {
    const config = ROLE_CONFIGS[roleKey];
    if (!config) return;

    currentRole = roleKey;

    // Update active tab button
    roleTabs.forEach(tab => {
      const isSelected = tab.dataset.role === roleKey;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    // Update Banner & Badges
    roleClearanceBadge.textContent = config.clearance;
    roleBannerIcon.textContent = config.icon;
    roleBannerTitle.textContent = config.title;
    roleBannerDesc.textContent = config.desc;

    // Autofill Credentials
    emailInput.value = config.email;
    passwordInput.value = config.pass;

    // Clear error states
    groupEmail.classList.remove('has-error');
    groupPassword.classList.remove('has-error');

    if (notify) {
      showToast(`Selected ${config.name} role: Preset credentials applied`, 'info', config.icon);
    }
  }

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const roleKey = tab.dataset.role;
      setRole(roleKey);
    });
  });

  // ------------------------------------------------------------------------
  // 4. Password Toggle
  // ------------------------------------------------------------------------
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

    if (isPassword) {
      // Eye-off icon
      eyeIcon.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      `;
    } else {
      // Normal eye icon
      eyeIcon.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      `;
    }
  });

  // ------------------------------------------------------------------------
  // 5. Form Validation & Submission
  // ------------------------------------------------------------------------
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasError = false;
    const emailVal = emailInput.value.trim();
    const passVal = passwordInput.value.trim();

    // Basic regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      groupEmail.classList.add('has-error');
      hasError = true;
    } else {
      groupEmail.classList.remove('has-error');
    }

    if (passVal.length < 6) {
      groupPassword.classList.add('has-error');
      hasError = true;
    } else {
      groupPassword.classList.remove('has-error');
    }

    if (hasError) {
      showToast('Please check the highlighted authentication fields', 'warn', '⚠️');
      return;
    }

    // Trigger Auth Animation
    triggerAuthentication();
  });

  function triggerAuthentication() {
    submitLoginBtn.classList.add('loading');
    submitBtnText.textContent = 'Verifying RBAC Cryptographic Token...';

    setTimeout(() => {
      submitLoginBtn.classList.remove('loading');
      submitBtnText.textContent = 'Authenticate & Launch Portal';

      const config = ROLE_CONFIGS[currentRole];
      if (config.requiresMfa) {
        showToast('Role requires Secondary Security Clearance (MFA)', 'info', '🔐');
        openModal(mfaModal);
      } else {
        grantAccess();
      }
    }, 1100);
  }

  function grantAccess() {
    const config = ROLE_CONFIGS[currentRole];
    showToast(`Access Granted! Welcome to ${config.title}`, 'success', '🚀');

    // Populate Portal Preview
    portalAvatar.textContent = config.icon;
    portalWelcomeName.textContent = config.welcomeName;
    portalRoleTag.textContent = config.roleTag;

    // Render stats
    portalQuickStats.innerHTML = config.stats.map(s => `
      <div class="portal-stat-card">
        <div class="portal-stat-num">${s.num}</div>
        <div class="portal-stat-title">${s.title}</div>
      </div>
    `).join('');

    // Render actions
    portalActionButtons.innerHTML = config.actions.map(act => `
      <button type="button" class="portal-action-btn" onclick="window.triggerDemoAction('${act.label}')">
        <span>${act.icon} ${act.label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `).join('');

    // Switch view
    loginCard.classList.add('hidden');
    portalPreviewCard.classList.remove('hidden');
  }

  // Logout / Switch Role
  portalLogoutBtn.addEventListener('click', () => {
    portalPreviewCard.classList.add('hidden');
    loginCard.classList.remove('hidden');
    showToast('Session cleanly terminated. Returned to sign-in.', 'info', '🔒');
  });

  // Global handler for action clicks in portal preview
  window.triggerDemoAction = (actionTitle) => {
    showToast(`Initializing module: "${actionTitle}"...`, 'info', '⚡');
  };

  // ------------------------------------------------------------------------
  // 6. MFA Modal Logic
  // ------------------------------------------------------------------------
  mfaDigits.forEach((digit, index) => {
    digit.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < mfaDigits.length - 1) {
        mfaDigits[index + 1].focus();
      }
    });

    digit.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        mfaDigits[index - 1].focus();
      }
    });
  });

  verifyMfaBtn.addEventListener('click', () => {
    verifyMfaBtn.innerHTML = `<span>Verifying TOTP...</span>`;
    setTimeout(() => {
      verifyMfaBtn.innerHTML = `<span>Verify & Unlock Portal</span>`;
      closeModal(mfaModal);
      grantAccess();
    }, 700);
  });

  // ------------------------------------------------------------------------
  // 7. WebAuthn Passkey Modal Logic
  // ------------------------------------------------------------------------
  passkeyBtn.addEventListener('click', () => {
    passkeyStatusText.textContent = 'Touch your hardware security key or verify Face ID...';
    biometricRing.style.borderColor = 'rgba(0, 242, 254, 0.4)';
    openModal(passkeyModal);
  });

  simulateBiometricTouchBtn.addEventListener('click', () => {
    passkeyStatusText.textContent = 'Scanning cryptographic biometric signature...';
    biometricRing.style.borderColor = '#00f2fe';

    setTimeout(() => {
      passkeyStatusText.textContent = 'Signature Verified: FIDO2 Token Match!';
      biometricRing.style.borderColor = '#10b981';

      setTimeout(() => {
        closeModal(passkeyModal);
        grantAccess();
      }, 700);
    }, 900);
  });

  // ------------------------------------------------------------------------
  // 8. SSO Simulators & Forgot Key
  // ------------------------------------------------------------------------
  ssoGoogleBtn.addEventListener('click', () => {
    showToast('Connecting to Google Workspace for Education SSO...', 'info', '🌐');
    setTimeout(() => {
      grantAccess();
    }, 1000);
  });

  ssoMicrosoftBtn.addEventListener('click', () => {
    showToast('Connecting to Microsoft 365 Education Tenant...', 'info', '🌐');
    setTimeout(() => {
      grantAccess();
    }, 1000);
  });

  forgotPassBtn.addEventListener('click', () => {
    showToast('Password recovery token dispatched to your institutional mail', 'info', '📧');
  });

  // ------------------------------------------------------------------------
  // 9. Telemetry Modal
  // ------------------------------------------------------------------------
  openTelemetryBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(telemetryModal);
  });

  closeTelemetryModalBtn.addEventListener('click', () => closeModal(telemetryModal));
  closeMfaModalBtn.addEventListener('click', () => closeModal(mfaModal));
  closePasskeyModalBtn.addEventListener('click', () => closeModal(passkeyModal));

  function openModal(modalEl) {
    modalEl.classList.remove('hidden');
  }

  function closeModal(modalEl) {
    modalEl.classList.add('hidden');
  }

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [telemetryModal, mfaModal, passkeyModal].forEach(closeModal);
    }
  });

  [telemetryModal, mfaModal, passkeyModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // ------------------------------------------------------------------------
  // 10. Agentic Reasoning Stream Ticker & Live Clock
  // ------------------------------------------------------------------------
  const AGENT_STREAM_EVENTS = [
    { agent: 'ConstraintSolver:', msg: 'Optimized Lab CS-201 allocation for Section B (Zero faculty overtime).' },
    { agent: 'DisruptionForecaster:', msg: 'Monsoon alert on 28th Sep: Pre-routing outdoor survey lab to Virtual VR Studio.' },
    { agent: 'WorkloadBalancer:', msg: 'Rebalanced Mechanical Dept timetable: Reduced standard deviation of hours to 1.4h.' },
    { agent: 'LeaveSubstituteAgent:', msg: 'Dr. Sharma casual leave: Matched Prof. Roy for CS402 based on expertise rank #1.' },
    { agent: 'DigitalTwinSync:', msg: 'Simulated 10,000 seating permutation scenarios: Zero adjacent roll overlap in finals.' },
    { agent: 'AnomalySentinel:', msg: 'RBAC verification: 100% cryptographic integrity verified across all 5 operational roles.' }
  ];

  let eventIndex = 0;

  function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    if (liveAgentClock) {
      liveAgentClock.textContent = timeStr;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  function cycleAgentFeed() {
    eventIndex = (eventIndex + 1) % AGENT_STREAM_EVENTS.length;
    const item = AGENT_STREAM_EVENTS[eventIndex];
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    feedStream.innerHTML = `
      <div class="feed-entry active">
        <span class="feed-timestamp">[${timeStr}]</span>
        <span class="feed-agent">${item.agent}</span>
        <span class="feed-msg">${item.msg}</span>
      </div>
    `;
  }
  setInterval(cycleAgentFeed, 4000);

  // ------------------------------------------------------------------------
  // 11. Toast Notification Helper
  // ------------------------------------------------------------------------
  function showToast(msg, type = 'info', icon = 'ℹ️') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-text">${msg}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ------------------------------------------------------------------------
  // 12. Dynamic Neural Network Canvas Animation
  // ------------------------------------------------------------------------
  const canvas = document.getElementById('neuralCanvas');
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 65;
  const CONNECT_DISTANCE = 140;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1.2;
      this.color = Math.random() > 0.6 ? '#00f2fe' : (Math.random() > 0.3 ? '#6366f1' : '#a855f7');
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
      this.pulseVal = Math.random() * Math.PI;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      this.pulseVal += this.pulseSpeed;
    }

    draw() {
      const alpha = 0.3 + 0.3 * Math.sin(this.pulseVal);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Mouse interaction
  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Connect lines
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DISTANCE) {
          const lineAlpha = (1 - dist / CONNECT_DISTANCE) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#4facfe';
          ctx.globalAlpha = lineAlpha;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Mouse proximity interaction
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 160) {
          const mAlpha = (1 - mdist / 160) * 0.45;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = '#00f2fe';
          ctx.globalAlpha = mAlpha;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animateCanvas);
  }

  animateCanvas();

  // Initialize with admin role preset
  setRole('admin', false);
});
