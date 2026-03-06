document.addEventListener("DOMContentLoaded", function () {
  const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const loginId = document.getElementById("loginId").value.trim();
      const password = document.getElementById("password").value;
      const user = getUsers().find(
        (u) => (u.username.toLowerCase() === loginId.toLowerCase() ||
                u.email.toLowerCase() === loginId.toLowerCase()) &&
               u.password === password
      );
      if (user) {
        // Store active session
        ["username", "email", "fullname", "password"].forEach(k => localStorage.setItem(k, user[k]));
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid credentials. Please check your username/email and password.");
      }
    });
  }

  // Signup
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const fullname = document.getElementById("fullname").value.trim();
      const username = document.getElementById("username").value.trim();
      const email    = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (password.length < 6) { alert("Password must be at least 6 characters long"); return; }

      const users = getUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert("This email is already registered. Please use a different email."); return;
      }
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("This username is already taken. Please choose a different one."); return;
      }

      users.push({ fullname, username, email, password });
      localStorage.setItem("users", JSON.stringify(users));
      // Also set active session keys for compatibility
      ["username", "email", "fullname", "password"].forEach(k => localStorage.setItem(k, eval(k)));

      alert("Account created successfully! Please login to continue.");
      window.location.href = "index.html";
    });
  }

  // Subtle lift animation on input focus
  document.querySelectorAll(".form-group input").forEach(input => {
    input.addEventListener("focus",  () => { input.parentElement.style.cssText = "transform:translateY(-2px);transition:transform .2s ease"; });
    input.addEventListener("blur",   () => { input.parentElement.style.transform = "translateY(0)"; });
  });
});


// ── Landing Page ────────────────────────────────
// Navbar scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.feature-card, .step, .cta-box').forEach((el, i) => {
    el.dataset.delay = i % 3;
    observer.observe(el);
  });

  // Modal controls
  function openModal(type) { document.getElementById(type+'Modal').classList.add('open'); document.body.style.overflow='hidden'; }
  function closeModal(type) { document.getElementById(type+'Modal').classList.remove('open'); document.body.style.overflow=''; }
  function switchModal(from, to) { closeModal(from); setTimeout(() => openModal(to), 220); }

  document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o){ o.classList.remove('open'); document.body.style.overflow=''; } }));
  document.addEventListener('keydown', e => { if(e.key==='Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => { m.classList.remove('open'); document.body.style.overflow=''; }); });

  // Auth
  function getUsers() { return JSON.parse(localStorage.getItem('users')||'[]'); }

  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('loginId').value.trim();
    const pw = document.getElementById('loginPassword').value;
    const err = document.getElementById('loginError');
    const user = getUsers().find(u => (u.username.toLowerCase()===id.toLowerCase()||u.email.toLowerCase()===id.toLowerCase()) && u.password===pw);
    if (user) {
      ['username','email','fullname','password'].forEach(k => localStorage.setItem(k, user[k]));
      localStorage.setItem('isLoggedIn','true');
      window.location.href='dashboard.html';
    } else { err.classList.add('show'); setTimeout(()=>err.classList.remove('show'),3000); }
  });

  document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value.trim();
    const username = document.getElementById('username').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const err = document.getElementById('signupError');
    if (password.length < 6) { err.textContent='Password must be at least 6 characters.'; err.classList.add('show'); return; }
    const users = getUsers();
    if (users.find(u=>u.email.toLowerCase()===email.toLowerCase())) { err.textContent='Email already registered.'; err.classList.add('show'); return; }
    if (users.find(u=>u.username.toLowerCase()===username.toLowerCase())) { err.textContent='Username already taken.'; err.classList.add('show'); return; }
    users.push({fullname,username,email,password});
    localStorage.setItem('users',JSON.stringify(users));
    // Don't auto-login — switch to login modal and show success message
    document.getElementById('signupForm').reset();
    switchModal('signup','login');
    setTimeout(() => {
      const msg = document.getElementById('loginSuccess');
      msg.classList.add('show');
      setTimeout(() => msg.classList.remove('show'), 5000);
    }, 300);
  });

  // Auto-open modal from redirect
  if (new URLSearchParams(window.location.search).get('signup') === '1') openModal('signup');

  // Input lift effect
  document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', function(){ this.parentElement.style.cssText='transform:translateY(-1px);transition:transform .2s'; });
    input.addEventListener('blur', function(){ this.parentElement.style.transform=''; });
  });