let generatedOtp = "";

// Generate a random 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Step 1: Verify email and send OTP
const forgotForm = document.getElementById("forgotForm");
forgotForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const storedEmail = localStorage.getItem("email");

  if (email === storedEmail) {
    generatedOtp = generateOtp();
    showToast(
      "Your OTP is: " +
        generatedOtp +
        " (In a real app, this would be sent to your email)",
      "success",
    );

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
  } else {
    showToast("Email not found. Please check and try again.", "error");
  }
});

// Step 2: Verify OTP
const otpForm = document.getElementById("otpForm");
otpForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const enteredOtp = document.getElementById("otp").value;

  if (enteredOtp === generatedOtp) {
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";
  } else {
    showToast("Invalid OTP. Please try again.", "error");
  }
});

// Resend OTP
document.getElementById("resendOtp").addEventListener("click", function (e) {
  e.preventDefault();
  generatedOtp = generateOtp();
  showToast(
    "New OTP is: " +
      generatedOtp +
      " (In a real app, this would be sent to your email)",
    "success",
  );
});

// Step 3: Reset password
const resetForm = document.getElementById("resetForm");
resetForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword.length < 6) {
    showToast("Password must be at least 6 characters long.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("Passwords do not match. Please try again.", "error");
    return;
  }

  localStorage.setItem("password", newPassword);

  document.getElementById("step3").style.display = "none";
  document.getElementById("step4").style.display = "block";
});

// Custom Toast Notification Function (Shared)
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

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) container.remove();
    }, 300);
  }, 4000);
}
