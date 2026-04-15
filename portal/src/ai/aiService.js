const axios = require("axios");

const AI_URL = "http://localhost:5000/check-duplicate";

async function checkDuplicateAI(complaint) {
  try {
    const response = await axios.post(AI_URL, {
      title: complaint.title,
      description: complaint.description,
      department: complaint.department,
    });

    return response.data;
  } catch (error) {
    console.error("AI Error:", error.message);
    return { is_duplicate: false };
  }
}

module.exports = { checkDuplicateAI };
