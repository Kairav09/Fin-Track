// Login and Signup Form Handling

document.addEventListener("DOMContentLoaded", function () {
  // Handle login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const loginId = document.getElementById("loginId").value;
      const password = document.getElementById("password").value;

      // Check if user exists in localStorage
      const storedUsername = localStorage.getItem("username");
      const storedEmail = localStorage.getItem("email");
      const storedPassword = localStorage.getItem("password");

      // Validate credentials - accept either username or email
      if (
        (loginId === storedUsername || loginId === storedEmail) &&
        password === storedPassword
      ) {
        // User authenticated successfully
        localStorage.setItem("isLoggedIn", "true");

        // Redirect to dashboard
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

      const fullname = document.getElementById("fullname").value;
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Validate password length
      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      // Store user credentials in localStorage
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      localStorage.setItem("fullname", fullname);

      // Show success message and redirect to login page
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
