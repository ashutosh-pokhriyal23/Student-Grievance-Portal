/**
 * Minimal mock Email Service.
 * Pluggable design to swap later for nodemailer or SendGrid.
 */
exports.sendOTP = async (email, otp) => {
  // In a real application, you would initialize SMTP transport here.
  
  console.log('\n----------------------------------------');
  console.log(`✉️ INTERNAL MOCK EMAIL SERVER ✉️`);
  console.log(`TO: ${email}`);
  console.log(`SUBJECT: Student Grievance Portal - Verification Code`);
  console.log(`BODY: Your One-Time Password (OTP) is: ${otp}`);
  console.log('----------------------------------------\n');
  
  // Simulated async delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};
