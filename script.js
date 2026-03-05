// Login and Signup Form Handling

document.addEventListener("DOMContentLoaded", function () {
  // Get all registered users
  function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
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
        alert(
          "Invalid credentials. Please check your username/email and password.",
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
        alert("Password must be at least 6 characters long");
        return;
      }

      // Check for duplicate email or username
      const users = getUsers();

      const emailTaken = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (emailTaken) {
        alert(
          "This email is already registered. Please use a different email.",
        );
        return;
      }

      const usernameTaken = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase(),
      );
      if (usernameTaken) {
        alert("This username is already taken. Please choose a different one.");
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

      alert("Account created successfully! Please login to continue.");
      window.location.href = "index.html";
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
