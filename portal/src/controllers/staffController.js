const supabase = require('../config/supabase');

// SLA mapping in milliseconds
const SLA_TIERS = {
  P0: 24 * 60 * 60 * 1000,
  P1: 72 * 60 * 60 * 1000,
  P2: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Get stats for staff dashboard
 */
exports.getStaffStats = async (req, res, next) => {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('status, priority, created_at');

    if (error) throw error;

    const stats = {
      total: complaints.length,
      open: complaints.filter(c => c.status === 'created' || c.status === 'assigned').length,
      in_progress: complaints.filter(c => c.status === 'in_progress').length,
      escalated: complaints.filter(c => {
        if (['resolved', 'closed'].includes(c.status)) return false;
        const deadline = new Date(c.created_at).getTime() + (SLA_TIERS[c.priority] || SLA_TIERS.P2);
        return Date.now() > deadline;
      }).length
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all complaints with filters for staff
 */
exports.getStaffComplaints = async (req, res, next) => {
  try {
    const { space_id, status, priority, search } = req.query;

    let query = supabase
      .from('complaints')
      .select('*, space:spaces(name, type)')
      .order('created_at', { ascending: false });

    if (space_id) query = query.eq('space_id', space_id);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    // Attach escalation flag dynamically
    const complaintsWithSLA = data.map(c => {
      const deadline = new Date(c.created_at).getTime() + (SLA_TIERS[c.priority] || SLA_TIERS.P2);
      return {
        ...c,
        is_escalated: !['resolved', 'closed'].includes(c.status) && Date.now() > deadline,
        deadline
      };
    });

    res.json({ success: true, data: complaintsWithSLA });
  } catch (error) {
    next(error);
  }
};

/**
 * Update complaint status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        status, 
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
