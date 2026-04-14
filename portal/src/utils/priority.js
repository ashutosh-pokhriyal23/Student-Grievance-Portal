/**
 * Calculates complaint priority based on upvote count
 * @param {number} upvotes
 * @returns {string} 'P0' | 'P1' | 'P2'
 */
const calculatePriority = (upvotes) => {
  if (upvotes >= 25) return 'P0';
  if (upvotes >= 15) return 'P1';
  return 'P2';
};

module.exports = { calculatePriority };
