const supabase = require('../config/supabase');

/**
 * Get all spaces with their open complaint counts
 */
exports.getAllSpaces = async (req, res, next) => {
  try {
    // Fetch all spaces
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .select('*');

    if (spacesError) throw spacesError;

    // Fetch complaint counts per space (where status != 'resolved' and status != 'closed')
    // Note: In a production environment, this could be optimized with a grouping query or a view
    const { data: counts, error: countsError } = await supabase
      .from('complaints')
      .select('space_id')
      .not('status', 'in', '("resolved", "closed")');

    if (countsError) throw countsError;

    // Map counts to spaces
    const spaceCounts = spaces.map(space => {
      const openCount = counts.filter(c => c.space_id === space.id).length;
      return { ...space, open_complaints: openCount };
    });

    res.json({
      success: true,
      data: spaceCounts
    });
  } catch (error) {
    next(error);
  }
};
