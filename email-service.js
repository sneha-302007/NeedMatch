// ✅ email-service.js
// Handles all EmailJS setup and sending

// Load the EmailJS SDK from CDN
import "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";

// Initialize EmailJS (Public Key from your EmailJS dashboard)
(function () {
  emailjs.init("8Xom5zm-7kCW6LhvW"); // ✅ Replace with your own PUBLIC key
})();

// Export a helper function for sending emails
export function sendEmail(templateId, params) {
  return emailjs
    .send("service_u204r3p", templateId, params)
    .then((response) => {
      console.log("✅ Email sent successfully!", response);
      alert("📧 Email sent successfully to donor!");
    })
    .catch((error) => {
      console.error("❌ Failed to send email:", error);
      alert("⚠️ Failed to send email. Please check EmailJS configuration.");
    });
}




// Initialize EmailJS with your public key
emailjs.init("eLZ3xDLEZayjaFYMi"); // ← replace with your public key

/**
 * Send email to donor
 * @param {string} templateId - EmailJS template ID
 * @param {Object} templateParams - Parameters for your template
 */
async function sendEmailToDonor(templateId, templateParams) {
  try {
    const result = await emailjs.send("service_w0imm3v", templateId, templateParams);
    console.log("Email sent successfully:", result.text);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}
