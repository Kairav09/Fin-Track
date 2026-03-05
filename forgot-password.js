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
    alert(
      "Your OTP is: " +
        generatedOtp +
        "\n\n(In a real app, this would be sent to your email)",
    );

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
  } else {
    alert("Email not found. Please check and try again.");
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
    alert("Invalid OTP. Please try again.");
  }
});

// Resend OTP
document.getElementById("resendOtp").addEventListener("click", function (e) {
  e.preventDefault();
  generatedOtp = generateOtp();
  alert(
    "New OTP is: " +
      generatedOtp +
      "\n\n(In a real app, this would be sent to your email)",
  );
});

// Step 3: Reset password
const resetForm = document.getElementById("resetForm");
resetForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  localStorage.setItem("password", newPassword);

  document.getElementById("step3").style.display = "none";
  document.getElementById("step4").style.display = "block";
});
