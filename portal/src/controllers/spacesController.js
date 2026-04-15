const supabase = require('../config/supabase');

const FALLBACK_SPACES = [
  { id: 'fallback-asd', name: 'ASD (APPLIED SCIENCE DEPARTMENT)', type: 'department', open_complaints: 0 },
  { id: 'fallback-cse', name: 'CSE', type: 'department', open_complaints: 0 },
  { id: 'fallback-ece', name: 'ECE', type: 'department', open_complaints: 0 },
  { id: 'fallback-ee', name: 'EE', type: 'department', open_complaints: 0 },
  { id: 'fallback-civil', name: 'CIVIL', type: 'department', open_complaints: 0 },
  { id: 'fallback-mechanical', name: 'MECHANICAL', type: 'department', open_complaints: 0 },
  { id: 'fallback-chemical', name: 'CHEMICAL', type: 'department', open_complaints: 0 },
  { id: 'fallback-biotech', name: 'BIOTECHNOLOGY', type: 'department', open_complaints: 0 },
  { id: 'fallback-gomukh', name: 'GOMUKH', type: 'hostel', open_complaints: 0 },
  { id: 'fallback-ndh', name: 'NANDA DEVI HOSTEL (NDH)', type: 'hostel', open_complaints: 0 },
  { id: 'fallback-arawali', name: 'ARAWALI', type: 'hostel', open_complaints: 0 },
  { id: 'fallback-kailash', name: 'KAILASH', type: 'hostel', open_complaints: 0 },
  { id: 'fallback-nbh', name: 'NEW BOYS HOSTEL (NBH)', type: 'hostel', open_complaints: 0 },
  { id: 'fallback-vindhyachal', name: 'VINDHYACHAL', type: 'hostel', open_complaints: 0 },
  { id: 'fallback-yamunotri', name: 'YAMUNOTRI', type: 'hostel', open_complaints: 0 },
  { id: 'fallback-gangotri', name: 'GANGOTRI', type: 'hostel', open_complaints: 0 },
  { id: 'fallback-library', name: 'LIBRARY', type: 'facility', open_complaints: 0 },
  { id: 'fallback-cbc', name: 'COMPETENCY BUILDING CENTRE', type: 'facility', open_complaints: 0 },
  { id: 'fallback-tpc', name: 'TRAINING AND PLACEMENT CELL', type: 'career', open_complaints: 0 },
  { id: 'fallback-admin', name: 'ADMINISTRATION BLOCK', type: 'administrative', open_complaints: 0 },
  { id: 'fallback-sports', name: 'SPORTS DEPT', type: 'sports', open_complaints: 0 },
  { id: 'fallback-gym', name: 'GYM', type: 'sports', open_complaints: 0 },
  { id: 'fallback-theatre', name: 'MULTIPURPOSE THEATRE', type: 'cultural', open_complaints: 0 },
];

/**
 * Get all spaces with their open complaint counts
 */
exports.getAllSpaces = async (req, res, next) => {
  try {
    // Fetch all spaces
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .select('*');

    // Fetch all complaints with their space_id and status for accurate counting
    const { data: allComplaints, error: countsError } = await supabase
      .from('complaints')
      .select('space_id, status');

    // 2. Map counts to real spaces with safe fallback
    const baseSpaces = spacesError || !Array.isArray(spaces) || spaces.length === 0 ? FALLBACK_SPACES : spaces;
    
    // Filter out resolved/closed tickets in JS (case-insensitive)
    const openComplaints = (allComplaints || []).filter(c => {
      const status = String(c.status || '').toLowerCase();
      return !['resolved', 'closed'].includes(status);
    });

    const spaceCounts = baseSpaces.map(space => {
      const openCount = openComplaints.filter(c => c.space_id === space.id).length;
      return { ...space, open_complaints: openCount };
    });

    res.json({
      success: true,
      data: spaceCounts
    });
  } catch (error) {
    res.json({
      success: true,
      data: FALLBACK_SPACES,
    });
  }
};
