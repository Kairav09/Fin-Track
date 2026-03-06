let generatedOtp = "";

// Step 1: Verify email and send OTP
document.getElementById("forgotForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (!users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    alert("Email not found. Please check and try again."); return;
  }
  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  alert(`Your OTP is: ${generatedOtp}\n\n(In a real app, this would be sent to your email)`);
  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "block";
});

// Step 2: Verify OTP
document.getElementById("otpForm").addEventListener("submit", function (e) {
  e.preventDefault();
  if (document.getElementById("otp").value !== generatedOtp) {
    alert("Invalid OTP. Please try again."); return;
  }
  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "block";
});

// Resend OTP
document.getElementById("resendOtp").addEventListener("click", function (e) {
  e.preventDefault();
  generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  alert(`New OTP is: ${generatedOtp}\n\n(In a real app, this would be sent to your email)`);
});

// Step 3: Reset password
document.getElementById("resetForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  if (newPassword.length < 6) { alert("Password must be at least 6 characters long."); return; }
  if (newPassword !== confirmPassword) { alert("Passwords do not match. Please try again."); return; }
  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const idx = allUsers.findIndex(u => u.email.toLowerCase() === document.getElementById("email").value.toLowerCase());
  if (idx !== -1) allUsers[idx].password = newPassword;
  localStorage.setItem("users", JSON.stringify(allUsers));
  localStorage.setItem("password", newPassword);
  document.getElementById("step3").style.display = "none";
  document.getElementById("step4").style.display = "block";
});
// ── Theme ──────────────────────────────────────────────────────────────────────
(function() {
  const saved = localStorage.getItem("theme") || "dark";
  if (saved === "light") {
    document.body.classList.add("landing-light");
    document.getElementById("sunIcon").style.display  = "none";
    document.getElementById("moonIcon").style.display = "block";
  }
})();
document.getElementById("themeToggle").addEventListener("click", function() {
  const isLight = document.body.classList.toggle("landing-light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  document.getElementById("sunIcon").style.display  = isLight ? "none"  : "block";
  document.getElementById("moonIcon").style.display = isLight ? "block" : "none";
});

// ── Step progress dots ─────────────────────────────────────────────────────────
function setStep(n) {
  [1, 2, 3, 4].forEach(i => {
    const d = document.getElementById("dot" + i);
    d.className = "step-dot" + (i < n ? " done" : i === n ? " active" : "");
  });
}
document.getElementById("forgotForm").addEventListener("submit", () => setTimeout(() => setStep(2), 10));
document.getElementById("otpForm").addEventListener("submit",    () => setTimeout(() => setStep(3), 10));
document.getElementById("resetForm").addEventListener("submit",  () => setTimeout(() => setStep(4), 10));