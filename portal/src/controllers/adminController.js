const supabase = require('../config/supabase');

// SLA mapping in milliseconds
const SLA_TIERS = {
  P0: 24 * 60 * 60 * 1000,
  P1: 72 * 60 * 60 * 1000,
  P2: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Global KPIs Overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('status, priority, created_at');

    if (error) throw error;

    const total = complaints.length;
    const resolved = complaints.filter(c => ['resolved', 'closed'].includes(c.status)).length;
    const active = total - resolved;
    
    // Escalated (Deadline Passed)
    const escalated = complaints.filter(c => {
      if (['resolved', 'closed'].includes(c.status)) return false;
      const deadline = new Date(c.created_at).getTime() + (SLA_TIERS[c.priority] || SLA_TIERS.P2);
      return Date.now() > deadline;
    }).length;

    // SLA Compliance %
    const slaCompliantCount = complaints.filter(c => {
      if (!['resolved', 'closed'].includes(c.status)) return false;
      const responseTime = new Date(c.updated_at).getTime() - new Date(c.created_at).getTime();
      const limit = SLA_TIERS[c.priority] || SLA_TIERS.P2;
      return responseTime <= limit;
    }).length;

    const sla_compliance = total > 0 ? Math.round((slaCompliantCount / (resolved || 1)) * 100) : 100;

    res.json({
      success: true,
      data: { total, active, resolved, escalated, sla_compliance }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trends over time
 */
exports.getTrends = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('created_at, status')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const trendsMap = {};
    data.forEach(c => {
      const date = new Date(c.created_at).toISOString().split('T')[0];
      if (!trendsMap[date]) trendsMap[date] = { date, created: 0, resolved: 0 };
      trendsMap[date].created++;
      if (['resolved', 'closed'].includes(c.status)) trendsMap[date].resolved++;
    });

    res.json({ success: true, data: Object.values(trendsMap) });
  } catch (error) {
    next(error);
  }
};

/**
 * Performance metrics for Departments & Hostels
 */
exports.getPerformance = async (req, res, next) => {
  try {
    const { data: spaces, error: sError } = await supabase.from('spaces').select('*');
    const { data: complaints, error: cError } = await supabase.from('complaints').select('*');

    if (sError || cError) throw sError || cError;

    const performance = spaces.map(space => {
      const spaceComplaints = complaints.filter(c => c.space_id === space.id);
      const total = spaceComplaints.length;
      const active = spaceComplaints.filter(c => !['resolved', 'closed'].includes(c.status)).length;
      const resolvedItems = spaceComplaints.filter(c => ['resolved', 'closed'].includes(c.status));
      
      const compliantCount = resolvedItems.filter(c => {
        const time = new Date(c.updated_at).getTime() - new Date(c.created_at).getTime();
        return time <= (SLA_TIERS[c.priority] || SLA_TIERS.P2);
      }).length;

      const sla_compliance = total > 0 ? Math.round((compliantCount / (resolvedItems.length || 1)) * 100) : 100;
      
      // Avg resolution time in hours
      const avg_resolution_time = resolvedItems.length > 0 
        ? Math.round(resolvedItems.reduce((acc, c) => acc + (new Date(c.updated_at) - new Date(c.created_at)), 0) / (resolvedItems.length * 3600000))
        : 0;

      let status = 'good';
      if (sla_compliance < 60 || active > 10) status = 'critical';
      else if (sla_compliance < 80 || active > 5) status = 'warning';

      return {
        id: space.id,
        name: space.name,
        type: space.type,
        total,
        active,
        avg_resolution_time,
        sla_compliance,
        status
      };
    });

    res.json({
      success: true,
      data: {
        departments: performance.filter(p => p.type === 'department'),
        hostels: performance.filter(p => p.type === 'hostel')
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Escalations (Overdue)
 */
exports.getEscalations = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*, space:spaces(name, type)')
      .not('status', 'in', '("resolved", "closed")');

    if (error) throw error;

    const escalations = data.filter(c => {
      const deadline = new Date(c.created_at).getTime() + (SLA_TIERS[c.priority] || SLA_TIERS.P2);
      return Date.now() > deadline;
    }).map(c => ({
      ...c,
      overdue_time: Math.round((Date.now() - (new Date(c.created_at).getTime() + (SLA_TIERS[c.priority] || SLA_TIERS.P2))) / 3600000)
    })).sort((a, b) => b.overdue_time - a.overdue_time);

    res.json({ success: true, data: escalations });
  } catch (error) {
    next(error);
  }
};

/**
 * Category breakdown
 */
exports.getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('category, space:spaces(name)');

    if (error) throw error;

    const counts = {};
    data.forEach(c => {
      if (!counts[c.category]) counts[c.category] = { category: c.category, count: 0, top_space: '' };
      counts[c.category].count++;
      // Simplified top space logic (first one for now, or could count per space)
      counts[c.category].top_space = c.space?.name; 
    });

    res.json({ success: true, data: Object.values(counts).sort((a, b) => b.count - a.count) });
  } catch (error) {
    next(error);
  }
};
