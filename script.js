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