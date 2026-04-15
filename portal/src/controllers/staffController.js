const supabase = require('../config/supabase');

// SLA mapping in milliseconds
const SLA_TIERS = {
  P0: 24 * 60 * 60 * 1000,
  P1: 72 * 60 * 60 * 1000,
  P2: 7 * 24 * 60 * 60 * 1000,
};

// Mocked Staff Roles (In real app, this comes from DB)
const MOCK_STAFF = {
  id: 'staff_001',
  name: 'Dr. Rajesh Kumar',
  roles: ['HOD - EE', 'Faculty - ECE', 'Warden - NBH Hostel'],
  allowed_space_ids: [] // Will fetch these dynamically or assume all for now
};

/**
 * Get available statuses (Dynamic Config)
 */
exports.getStatuses = async (req, res, next) => {
  try {
    const statuses = [
      { id: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700', theme: 'indigo' },
      { id: 'on_hold', label: 'On Hold', color: 'bg-indigo-50 text-indigo-700', theme: 'slate' },
      { id: 'resolved', label: 'Resolved', color: 'bg-emerald-50 text-emerald-700', theme: 'emerald' },
      { id: 'closed', label: 'Closed', color: 'bg-slate-50 text-slate-700', theme: 'slate' },
    ];
    res.json({ success: true, data: statuses });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Staff Profile & Roles
 */
exports.getStaffProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: MOCK_STAFF });
  } catch (error) {
    next(error);
  }
};

/**
 * Get stats for staff dashboard (Personalized)
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
 * Get available maintainers for a space
 */
exports.getMaintainers = async (req, res, next) => {
  try {
    const { space_id } = req.query;
    // In real app, fetch from maintainers table. 
    // Here we generate realistic mock data based on space
    const mockMaintainers = [
      { id: 'm1', name: 'Ayush Sharma', roll_suffix: '02', space_id: space_id },
      { id: 'm2', name: 'Amit Verma', roll_suffix: '15', space_id: space_id },
      { id: 'm3', name: 'Sagar Singh', roll_suffix: '44', space_id: space_id }
    ];
    res.json({ success: true, data: mockMaintainers });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign Maintainer to Complaint
 */
exports.assignMaintainer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { maintainer_id } = req.body;

    // Update complaint with maintainer and set status to assigned
    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        status: 'assigned',
        // maintainer_id would be a column here in a full schema
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

/**
 * Update complaint status
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: newStatus, comment } = req.body;

    // 1. Fetch current status and space_id
    const { data: complaint, error: fetchError } = await supabase
      .from('complaints')
      .select('status, space_id, status_history')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const oldStatus = complaint.status;
    const spaceId = complaint.space_id;

    // 2. Append to history
    const history = Array.isArray(complaint.status_history) ? complaint.status_history : [];
    const newEntry = {
      status: newStatus,
      comment,
      timestamp: new Date().toISOString(),
      updated_by: req.user?.name || 'Staff'
    };

    // 3. Update the complaint
    const { data, error } = await supabase
      .from('complaints')
      .update({ 
        status: newStatus, 
        latest_comment: comment,
        status_history: [...history, newEntry],
        updated_at: new Date() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 4. Update Space Counter Logic
    const closedStatuses = ['resolved', 'closed'];
    const wasClosed = closedStatuses.includes(oldStatus?.toLowerCase());
    const isNowClosed = closedStatuses.includes(newStatus?.toLowerCase());

    if (!wasClosed && isNowClosed) {
      // Transition from OPEN to CLOSED => Decrement
      await supabase.rpc('decrement_space_counter', { space_id_param: spaceId });
    } else if (wasClosed && !isNowClosed) {
      // Transition from CLOSED to OPEN (Re-open) => Increment
      await supabase.rpc('increment_space_counter', { space_id_param: spaceId });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
