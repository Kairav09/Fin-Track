let generatedOtp = "";

// Step 1: Verify email and send OTP
document.getElementById("forgotForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  if (email !== localStorage.getItem("email")) {
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
  localStorage.setItem("password", newPassword);
  document.getElementById("step3").style.display = "none";
  document.getElementById("step4").style.display = "block";
});