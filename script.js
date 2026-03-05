// Login and Signup Form Handling

document.addEventListener("DOMContentLoaded", function () {
  // Get all registered users
  function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
  }

  // Custom Toast Notification Function
  function showToast(message, type = "error") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const iconSvg =
      type === "error"
        ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
        : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    toast.innerHTML = `
      ${iconSvg}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }, 300); // Wait for transition to finish
    }, 3000);
  }

  // Handle login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const loginId = document.getElementById("loginId").value.trim();
      const password = document.getElementById("password").value;

      // Check against all registered users
      const users = getUsers();
      const user = users.find(
        (u) =>
          (u.username.toLowerCase() === loginId.toLowerCase() ||
            u.email.toLowerCase() === loginId.toLowerCase()) &&
          u.password === password,
      );

      if (user) {
        // User authenticated — store active user info
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", user.username);
        localStorage.setItem("email", user.email);
        localStorage.setItem("fullname", user.fullname);
        localStorage.setItem("password", user.password);

        window.location.href = "dashboard.html";
      } else {
        showToast(
          "Invalid credentials. Please check your username/email and password.",
          "error",
        );
      }
    });
  }

  // Handle signup form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const fullname = document.getElementById("fullname").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      // Validate password length
      if (password.length < 6) {
        showToast("Password must be at least 6 characters long", "error");
        return;
      }

      // Check for duplicate email or username
      const users = getUsers();

      const emailTaken = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (emailTaken) {
        showToast(
          "This email is already registered. Please use a different email.",
          "error",
        );
        return;
      }

      const usernameTaken = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase(),
      );
      if (usernameTaken) {
        showToast(
          "This username is already taken. Please choose a different one.",
          "error",
        );
        return;
      }

      // Add new user to the users array
      users.push({ fullname, username, email, password });
      localStorage.setItem("users", JSON.stringify(users));

      // Also set active user keys for backward compatibility
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      localStorage.setItem("fullname", fullname);

      showToast(
        "Account created successfully! Redirecting to login...",
        "success",
      );
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    });
  }

  // Add smooth focus animations to form inputs
  const formInputs = document.querySelectorAll(".form-group input");
  formInputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.style.transform = "translateY(-2px)";
      this.parentElement.style.transition = "transform 0.2s ease";
    });

    input.addEventListener("blur", function () {
      this.parentElement.style.transform = "translateY(0)";
    });
  });
});
