const supabase = require('../config/supabase');
const { calculatePriority } = require('../utils/priority');
const {checkDuplicateAI}=require("../ai/aiService")
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
      // Skip query if space_id is not a valid UUID — avoids Postgres cast error
      if (!UUID_REGEX.test(space_id)) {
        return res.json({ success: true, data: [] });
      }
      query = query.eq('space_id', space_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
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
 * Upvote or un-upvote a complaint (per-user toggle)
 */
exports.upvoteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    // Check if user already upvoted
    const { data: existing, error: checkError } = await supabase
      .from('complaint_upvotes')
      .select('id')
      .eq('complaint_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) throw checkError;

    const isUpvoted = !!existing;

    if (action === 'upvote' && !isUpvoted) {
      const { error: insertError } = await supabase
        .from('complaint_upvotes')
        .insert({ complaint_id: id, user_id: userId });
      if (insertError) throw insertError;
    } else if (action === 'unvote' && isUpvoted) {
      const { error: deleteError } = await supabase
        .from('complaint_upvotes')
        .delete()
        .eq('complaint_id', id)
        .eq('user_id', userId);
      if (deleteError) throw deleteError;
    }

    // Recalculate total upvotes
    const { count, error: countError } = await supabase
      .from('complaint_upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('complaint_id', id);

    if (countError) throw countError;

    const newUpvoteCount = count || 0;
    const newPriority = calculatePriority(newUpvoteCount);

    const { data: updatedComplaint, error: updateError } = await supabase
      .from('complaints')
      .update({ upvotes: newUpvoteCount, priority: newPriority, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ success: true, data: updatedComplaint });
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
