const supabase = require('../config/supabase');
const { calculatePriority } = require('../utils/priority');

/**
 * Get all complaints for a specific space
 */
exports.getComplaintsBySpace = async (req, res, next) => {
  try {
    const { space_id } = req.query;
    
    let query = supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (space_id) {
      query = query.eq('space_id', space_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new complaint
 */
exports.createComplaint = async (req, res, next) => {
  try {
    const { 
      space_id, 
      title, 
      description, 
      category, 
      is_anonymous, 
      student_name, 
      student_email,
      image_url,
      submitted_by,
      email
    } = req.body;

    const { data, error } = await supabase
      .from('complaints')
      .insert([
        { 
          space_id, 
          title, 
          description, 
          category, 
          is_anonymous, 
          student_name: is_anonymous ? null : (student_name || submitted_by || null), 
          student_email: is_anonymous ? null : (student_email || email || null),
          image_url: image_url || null,
          status: 'created',
          priority: 'P2',
          upvotes: 0
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upvote a complaint and update its priority
 */
exports.upvoteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Get current upvotes
    const { data: complaint, error: fetchError } = await supabase
      .from('complaints')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newUpvoteCount = (complaint.upvotes || 0) + 1;
    const newPriority = calculatePriority(newUpvoteCount);

    // 2. Update DB
    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update({ 
        upvotes: newUpvoteCount,
        priority: newPriority,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      data: updatedComplaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single complaint detail
 */
exports.getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('complaints')
      .select('*, space:spaces(name, type)')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
