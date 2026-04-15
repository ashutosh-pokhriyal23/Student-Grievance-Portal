const supabase = require('../config/supabase');

const FALLBACK_TEACHERS = [
  { id: 'fallback-asd-1', name: 'Lata Bisht', email: 'lata@college.edu', department: 'ASD' },
  { id: 'fallback-asd-2', name: 'Dr Kuldeep Kholiya', email: 'kuldeep@college.edu', department: 'ASD' },
  { id: 'fallback-asd-3', name: 'Dr RK Pandey', email: 'rkpandey@college.edu', department: 'ASD' },
  { id: 'fallback-asd-4', name: 'Neetu Rawat', email: 'neetu@college.edu', department: 'ASD' },
  { id: 'fallback-asd-5', name: 'Renu Bisht', email: 'renu@college.edu', department: 'ASD' },
  { id: 'fallback-cse-1', name: 'K. S. Vaisla', email: 'ksvaisla@college.edu', department: 'CSE' },
  { id: 'fallback-cse-2', name: 'Rajendra Kumar Bharti', email: 'rkbharti@college.edu', department: 'CSE' },
  { id: 'fallback-cse-3', name: 'Kapil Choudhary', email: 'kapil@college.edu', department: 'CSE' },
  { id: 'fallback-cse-4', name: 'Vishal Kumar', email: 'vishal@college.edu', department: 'CSE' },
  { id: 'fallback-cse-5', name: 'Archana Verma', email: 'archana@college.edu', department: 'CSE' },
  { id: 'fallback-cse-6', name: 'Sachin Gaur', email: 'sachin@college.edu', department: 'CSE' },
  { id: 'fallback-cse-7', name: 'Tanuja Patwal', email: 'tanuja@college.edu', department: 'CSE' },
  { id: 'fallback-ece-1', name: 'Lalit Gariya', email: 'lalit@college.edu', department: 'ECE' },
  { id: 'fallback-ece-2', name: 'Varun Kakkar', email: 'varun@college.edu', department: 'ECE' },
  { id: 'fallback-ece-3', name: 'Parul Kansal', email: 'parul@college.edu', department: 'ECE' },
  { id: 'fallback-ece-4', name: 'Sanjay Singh', email: 'sanjay@college.edu', department: 'ECE' },
  { id: 'fallback-ece-5', name: 'Vijiya Bhandari', email: 'vijiya@college.edu', department: 'ECE' },
  { id: 'fallback-ece-6', name: 'RP Joshi', email: 'rpjoshi@college.edu', department: 'ECE' },
  { id: 'fallback-ece-7', name: 'Jaspreet Singh', email: 'jaspreet@college.edu', department: 'ECE' },
];

const FALLBACK_SPACES = [
  { name: 'ASD (APPLIED SCIENCE DEPARTMENT)', type: 'department' },
  { name: 'CSE', type: 'department' },
  { name: 'ECE', type: 'department' },
  { name: 'EE', type: 'department' },
  { name: 'CIVIL', type: 'department' },
  { name: 'MECHANICAL', type: 'department' },
  { name: 'CHEMICAL', type: 'department' },
  { name: 'BIOTECHNOLOGY', type: 'department' },
  { name: 'GOMUKH', type: 'hostel' },
  { name: 'NANDA DEVI HOSTEL (NDH)', type: 'hostel' },
  { name: 'ARAWALI', type: 'hostel' },
  { name: 'KAILASH', type: 'hostel' },
  { name: 'NEW BOYS HOSTEL (NBH)', type: 'hostel' },
  { name: 'VINDHYACHAL', type: 'hostel' },
  { name: 'YAMUNOTRI', type: 'hostel' },
  { name: 'GANGOTRI', type: 'hostel' },
  { name: 'LIBRARY', type: 'facility' },
  { name: 'COMPETENCY BUILDING CENTRE', type: 'facility' },
  { name: 'TRAINING AND PLACEMENT CELL', type: 'career' },
  { name: 'ADMINISTRATION BLOCK', type: 'administrative' },
  { name: 'SPORTS DEPT', type: 'sports' },
  { name: 'GYM', type: 'sports' },
  { name: 'MULTIPURPOSE THEATRE', type: 'cultural' },
];

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
      .select('status, priority, created_at, updated_at');

    if (error) {
      // Table may not exist yet — return zeroed stats
      return res.json({
        success: true,
        data: { total: 0, active: 0, resolved: 0, escalated: 0, sla_compliance: 100 }
      });
    }

    const total = complaints.length;
    const resolved = complaints.filter(c => ['resolved', 'closed'].includes(c.status)).length;
    const active = total - resolved;
    
    const escalated = complaints.filter(c => {
      if (['resolved', 'closed'].includes(c.status)) return false;
      const deadline = new Date(c.created_at).getTime() + (SLA_TIERS[c.priority] || SLA_TIERS.P2);
      return Date.now() > deadline;
    }).length;

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
    res.json({
      success: true,
      data: { total: 0, active: 0, resolved: 0, escalated: 0, sla_compliance: 100 }
    });
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

    if (error) {
      return res.json({ success: true, data: [] });
    }

    const trendsMap = {};
    data.forEach(c => {
      const date = new Date(c.created_at).toISOString().split('T')[0];
      if (!trendsMap[date]) trendsMap[date] = { date, created: 0, resolved: 0 };
      trendsMap[date].created++;
      if (['resolved', 'closed'].includes(c.status)) trendsMap[date].resolved++;
    });

    res.json({ success: true, data: Object.values(trendsMap) });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

/**
 * Performance metrics for Departments & Hostels
 */
exports.getPerformance = async (req, res, next) => {
  try {
    const { data: spaces, error: sError } = await supabase.from('spaces').select('*');
    const { data: complaints, error: cError } = await supabase.from('complaints').select('*');

    if (sError || cError) {
      return res.json({ success: true, data: { departments: [], hostels: [] } });
    }

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
      
      const avg_resolution_time = resolvedItems.length > 0 
        ? Math.round(resolvedItems.reduce((acc, c) => acc + (new Date(c.updated_at) - new Date(c.created_at)), 0) / (resolvedItems.length * 3600000))
        : 0;

      let status = 'good';
      if (sla_compliance < 60 || active > 10) status = 'critical';
      else if (sla_compliance < 80 || active > 5) status = 'warning';

      return { id: space.id, name: space.name, type: space.type, total, active, avg_resolution_time, sla_compliance, status };
    });

    res.json({
      success: true,
      data: {
        departments: performance.filter(p => p.type === 'department'),
        hostels: performance.filter(p => p.type === 'hostel')
      }
    });
  } catch (error) {
    res.json({ success: true, data: { departments: [], hostels: [] } });
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

    if (error) {
      return res.json({ success: true, data: [] });
    }

    const escalations = data.filter(c => {
      const deadline = new Date(c.created_at).getTime() + (SLA_TIERS[c.priority] || SLA_TIERS.P2);
      return Date.now() > deadline;
    }).map(c => ({
      ...c,
      overdue_time: Math.round((Date.now() - (new Date(c.created_at).getTime() + (SLA_TIERS[c.priority] || SLA_TIERS.P2))) / 3600000)
    })).sort((a, b) => b.overdue_time - a.overdue_time);

    res.json({ success: true, data: escalations });
  } catch (error) {
    res.json({ success: true, data: [] });
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

    if (error) {
      return res.json({ success: true, data: [] });
    }

    const counts = {};
    data.forEach(c => {
      if (!counts[c.category]) counts[c.category] = { category: c.category, count: 0, top_space: '' };
      counts[c.category].count++;
      counts[c.category].top_space = c.space?.name;
    });

    res.json({ success: true, data: Object.values(counts).sort((a, b) => b.count - a.count) });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};

const SPACE_HEAD_SELECT = 'id, space_id, teacher_id, assigned_date, removed_date, is_active';

const getHeadAssignmentsBody = (req) => {
  const assignments = req.body.assignments || req.body.pendingRows || req.body.rows || [];
  return Array.isArray(assignments) ? assignments : [];
};

const buildApiError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeAssignmentPayload = (body = {}) => {
  const spaceReference =
    body.space_id ||
    body.spaceId ||
    body.space_name ||
    body.spaceName ||
    body.space ||
    '';

  const teacherReference =
    body.teacher_id ||
    body.teacherId ||
    body.admin_id ||
    body.adminId ||
    body.admin ||
    '';

  return {
    spaceReference: String(spaceReference || '').trim(),
    teacherReference: String(teacherReference || '').trim(),
  };
};

const dedupeAssignments = (assignments, activeExisting = []) => {
  const seen = new Set(
    activeExisting.map((row) => `${row.space_id}:${row.teacher_id}`)
  );

  return assignments.filter((assignment) => {
    const key = `${assignment.space_id}:${assignment.teacher_id}`;
    if (!assignment.space_id || !assignment.teacher_id || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const isFallbackReference = (value) => String(value || '').trim().startsWith('fallback-');

const normalizeText = (value) => String(value || '').trim().toUpperCase();

const findFallbackSpace = (reference) => {
  const normalized = normalizeText(reference);
  return FALLBACK_SPACES.find((space) => normalizeText(space.name) === normalized) || null;
};

const findFallbackTeacher = (reference) => {
  const normalized = normalizeText(reference);
  return (
    FALLBACK_TEACHERS.find((teacher) => normalizeText(teacher.id) === normalized) ||
    FALLBACK_TEACHERS.find((teacher) => normalizeText(teacher.name) === normalized) ||
    null
  );
};

const resolveSpaceByReference = async (reference) => {
  const value = String(reference || '').trim();

  if (!value) {
    return null;
  }

  const { data: byId, error: byIdError } = await supabase
    .from('spaces')
    .select('id, name, type')
    .eq('id', value)
    .maybeSingle();

  if (!byIdError && byId) {
    return byId;
  }

  const { data: byName, error: byNameError } = await supabase
    .from('spaces')
    .select('id, name, type')
    .ilike('name', value)
    .maybeSingle();

  if (!byNameError && byName) {
    return byName;
  }

  const fallbackSpace = findFallbackSpace(value);
  if (!fallbackSpace) {
    return null;
  }

  // Try upsert so duplicate name doesn't cause an error
  const { data: createdSpace, error: createError } = await supabase
    .from('spaces')
    .upsert({ name: fallbackSpace.name, type: fallbackSpace.type }, { onConflict: 'name' })
    .select('id, name, type')
    .single();

  if (!createError && createdSpace) {
    return createdSpace;
  }

  console.error('resolveSpaceByReference: failed to upsert space:', createError?.message || createError);
  // Return null — caller will handle the UUID check failure cleanly
  return null;
};

const resolveTeacherByReference = async (reference) => {
  const value = String(reference || '').trim();

  if (!value) {
    return null;
  }

  const { data: byId, error: byIdError } = await supabase
    .from('teachers')
    .select('id, name, email, department')
    .eq('id', value)
    .maybeSingle();

  if (!byIdError && byId) {
    return byId;
  }

  const { data: byName, error: byNameError } = await supabase
    .from('teachers')
    .select('id, name, email, department')
    .ilike('name', value)
    .maybeSingle();

  if (!byNameError && byName) {
    return byName;
  }

  const fallbackTeacher = findFallbackTeacher(value);
  if (!fallbackTeacher) {
    return null;
  }

  // Try upsert by name so duplicate doesn't cause an error
  const { data: createdTeacher, error: createError } = await supabase
    .from('teachers')
    .upsert(
      {
        name: fallbackTeacher.name,
        email: fallbackTeacher.email || null,
        department: fallbackTeacher.department || null,
      },
      { onConflict: 'name' }
    )
    .select('id, name, email, department')
    .single();

  if (!createError && createdTeacher) {
    return createdTeacher;
  }

  console.error('resolveTeacherByReference: failed to upsert teacher:', createError?.message || createError);
  // Return null — caller will handle the UUID check failure cleanly
  return null;
};

const buildLookupMap = (items, keyFn) => {
  const map = new Map();
  items.forEach((item) => {
    map.set(keyFn(item), item);
  });
  return map;
};

const normalizeSpace = (space) => {
  if (!space) {
    return null;
  }

  return {
    id: space.id || null,
    name: space.name || null,
    type: space.type || null,
  };
};

const enrichSpaceHeadRows = async (rows) => {
  const { data: teachersData } = await supabase.from('teachers').select('*');
  const { data: spacesData } = await supabase.from('spaces').select('id, name, type');

  const teacherMap = buildLookupMap(
    (teachersData && teachersData.length > 0 ? teachersData : FALLBACK_TEACHERS).map((teacher) => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email || '',
      department: teacher.department || '',
    })),
    (teacher) => teacher.id
  );

  const spaceList = spacesData && spacesData.length > 0 ? spacesData.map(normalizeSpace) : FALLBACK_SPACES;
  const spaceMap = buildLookupMap(
    spaceList.map((space) => ({
      id: space.id || space.name,
      name: space.name,
      type: space.type || '',
    })),
    (space) => space.id || space.name
  );

  return rows.map((row) => ({
    ...row,
    teacher: teacherMap.get(row.teacher_id) || null,
    space:
      spaceMap.get(row.space_id) ||
      spaceList.find((space) => String(space.name || '').trim().toUpperCase() === String(row.space_id || '').trim().toUpperCase()) ||
      null,
  }));
};

exports.getTeachers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('department', { ascending: true })
      .order('name', { ascending: true });

    const teachers = error || !data || data.length === 0 ? FALLBACK_TEACHERS : data;

    res.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    res.json({
      success: true,
      data: FALLBACK_TEACHERS,
    });
  }
};

exports.getActiveSpaceHeads = async (req, res, next) => {
  try {
    const { space_id } = req.params;
    const resolvedSpace = await resolveSpaceByReference(space_id);
    const lookupValue = resolvedSpace?.id || space_id;

    const { data, error } = await supabase
      .from('space_heads')
      .select(SPACE_HEAD_SELECT)
      .eq('space_id', lookupValue)
      .order('assigned_date', { ascending: false });

    if (error) {
      return res.json({
        success: true,
        data: [],
      });
    }

    res.json({
      success: true,
      data: await enrichSpaceHeadRows(data || []),
    });
  } catch (error) {
    res.json({
      success: true,
      data: [],
    });
  }
};

exports.deleteSpaceHeadForever = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('space_heads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    res.json({
      success: true,
      data: null,
    });
  }
};

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (value) => UUID_REGEX.test(String(value || ''));

const insertSpaceHeads = async (assignments) => {
  if (!assignments.length) {
    return { inserted: [], skipped: 0 };
  }

  const targetSpaceReference = assignments[0].space_id;
  const resolvedSpace = await resolveSpaceByReference(targetSpaceReference);
  const targetSpaceId = resolvedSpace?.id || targetSpaceReference;

  if (!targetSpaceId) {
    return { inserted: [], skipped: assignments.length };
  }

  // Space must be a real UUID — fallback spaces can't be FK targets
  if (!isValidUUID(targetSpaceId)) {
    console.warn(`insertSpaceHeads: space "${targetSpaceId}" is not a valid UUID. Cannot insert.`);
    return { inserted: [], skipped: assignments.length };
  }

  const teacherIds = [...new Set(assignments.map((assignment) => assignment.teacher_id))];
  const resolvedTeachers = await Promise.all(teacherIds.map((teacherId) => resolveTeacherByReference(teacherId)));
  const teacherIdMap = new Map(
    resolvedTeachers
      .filter(Boolean)
      .map((teacher) => [teacher.id, teacher])
  );
  const teacherNameMap = new Map(
    resolvedTeachers
      .filter(Boolean)
      .map((teacher) => [normalizeText(teacher.name), teacher])
  );

  // Only check duplicates against valid UUID teacher IDs
  const validTeacherIds = teacherIds.filter(isValidUUID);
  const existingActive = validTeacherIds.length > 0
    ? await (async () => {
        const { data, error } = await supabase
          .from('space_heads')
          .select('space_id, teacher_id')
          .eq('space_id', targetSpaceId)
          .eq('is_active', true)
          .in('teacher_id', validTeacherIds);
        if (error) throw error;
        return data || [];
      })()
    : [];

  const uniqueAssignments = dedupeAssignments(assignments, existingActive);

  if (!uniqueAssignments.length) {
    return { inserted: [], skipped: assignments.length };
  }

  const rows = uniqueAssignments
    .map((assignment) => {
      const resolvedTeacherId =
        teacherIdMap.get(assignment.teacher_id)?.id ||
        teacherNameMap.get(normalizeText(assignment.teacher_id))?.id ||
        assignment.teacher_id;

      // Teacher must also be a real UUID — skip if not
      if (!isValidUUID(resolvedTeacherId)) {
        console.warn(`insertSpaceHeads: teacher "${resolvedTeacherId}" is not a valid UUID. Skipping row.`);
        return null;
      }

      return {
        space_id: targetSpaceId,
        teacher_id: resolvedTeacherId,
        assigned_date: assignment.assigned_date || new Date().toISOString(),
        removed_date: null,
        is_active: true,
      };
    })
    .filter(Boolean);

  if (!rows.length) {
    return { inserted: [], skipped: assignments.length };
  }

  const { data, error } = await supabase
    .from('space_heads')
    .insert(rows)
    .select(SPACE_HEAD_SELECT);

  if (error) throw error;

  return {
    inserted: await enrichSpaceHeadRows(data || []),
    skipped: assignments.length - rows.length,
  };
};

exports.assignSpaceHead = async (req, res, next) => {
  try {
    console.log('POST /api/admin/space-heads body:', req.body);

    const { spaceReference, teacherReference } = normalizeAssignmentPayload(req.body);

    if (!spaceReference || !teacherReference) {
      return res.status(400).json({
        success: false,
        message: 'spaceId/space_id and teacherId/adminId are required',
      });
    }

    const result = await insertSpaceHeads([{ space_id: spaceReference, teacher_id: teacherReference }]);

    if (!result.inserted.length) {
      return res.status(409).json({
        success: false,
        message:
          'Could not resolve space or teacher to a database record. ' +
          'Check the backend terminal for the exact Supabase error — ' +
          'it is likely an RLS (Row Level Security) policy blocking inserts on the spaces or teachers table. ' +
          'Either disable RLS on those tables in Supabase, or run the schema SQL to pre-seed the data.',
      });
    }

    return res.status(201).json({
      success: true,
      data: result.inserted[0],
      skipped: result.skipped,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error?.message || 'Failed to assign space head',
    });
  }
};

exports.removeSpaceHead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('space_heads')
      .update({
        removed_date: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', id)
      .select(SPACE_HEAD_SELECT)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: (await enrichSpaceHeadRows([data]))[0] || null,
    });
  } catch (error) {
    next(error);
  }
};

exports.saveSpaceHeads = async (req, res, next) => {
  try {
    const assignments = getHeadAssignmentsBody(req);
    const removals = Array.isArray(req.body.removals) ? req.body.removals : [];
    const normalized = assignments
      .map((assignment) => {
        const { spaceReference, teacherReference } = normalizeAssignmentPayload(assignment);

        return {
          space_id: spaceReference || req.body.space_id || req.body.spaceId || req.body.space_name || req.body.spaceName || null,
          teacher_id: teacherReference || assignment.teacher_id || assignment.teacherId || null,
          assigned_date: assignment.assigned_date || null,
        };
      })
      .filter((assignment) => assignment.space_id && assignment.teacher_id);

    if (!normalized.length) {
      if (!removals.length) {
        return res.json({
          success: true,
          data: [],
          skipped: 0,
          removed: 0,
        });
      }
    }

    let inserted = [];
    let skipped = 0;

    if (normalized.length) {
      const result = await insertSpaceHeads(normalized);
      inserted = result.inserted;
      skipped = result.skipped;
    }

    let removed = 0;
    if (removals.length) {
      const removalIds = removals.filter(Boolean);
      if (removalIds.length) {
        const { error: removeError } = await supabase
          .from('space_heads')
          .update({
            removed_date: new Date().toISOString(),
            is_active: false,
          })
          .in('id', removalIds);

        if (removeError) throw removeError;

        removed = removalIds.length;
      }
    }

    res.json({
      success: true,
      data: inserted,
      skipped,
      removed,
    });
  } catch (error) {
    next(error);
  }
};
