import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AssignForm from '../../components/admin/AssignForm';
import AssigneesTable from '../../components/admin/AssigneesTable';
import {
  getAdminSpaces,
  getAdminTeachers,
  getAdminSpaceHeads,
  assignAdminSpaceHead,
  saveAdminSpaceHeads,
  removeAdminSpaceHead,
  deleteAdminSpaceHeadForever,
} from '../../api/admin';

const initialFormState = {
  category: '',
  spaceId: '',
  department: '',
  teacherId: '',
};

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

const normalizeDepartment = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized.includes('APPLIED SCIENCE') || normalized === 'ASD') return 'ASD';
  if (normalized === 'CSE' || normalized.includes('COMPUTER SCIENCE')) return 'CSE';
  if (normalized === 'ECE' || normalized.includes('ELECTRONICS')) return 'ECE';
  if (normalized === 'EE' || normalized.includes('ELECTRICAL')) return 'EE';
  if (normalized === 'CIVIL' || normalized.includes('CIVIL ENGINEERING')) return 'CIVIL';
  if (normalized === 'MECHANICAL' || normalized.includes('MECHANICAL ENGINEERING')) return 'MECHANICAL';
  if (normalized === 'CHEMICAL' || normalized.includes('CHEMICAL ENGINEERING')) return 'CHEMICAL';
  if (normalized === 'BIOTECHNOLOGY' || normalized.includes('BIOTECH')) return 'BIOTECHNOLOGY';
  return normalized;
};

const isFallbackSpaceId = (value) => String(value || '').startsWith('fallback-');

const unwrapRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const SpaceHeads = () => {
  const [viewSpaceId, setViewSpaceId] = useState('');
  const [viewCategory, setViewCategory] = useState('');
  const [formState, setFormState] = useState(initialFormState);
  const [savedAssignees, setSavedAssignees] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedSpace = useMemo(
    () => {
      const spacePool = spaces.length > 0 ? spaces : FALLBACK_SPACES;
      return spacePool.find((space) => space.id === viewSpaceId || space.name === viewSpaceId) || null;
    },
    [spaces, viewSpaceId]
  );

  const loadInitialData = useCallback(async () => {
    try {
      const [teachersResponse, spacesResponse] = await Promise.allSettled([
        getAdminTeachers(),
        getAdminSpaces(),
      ]);

      const fetchedTeachers = teachersResponse.status === 'fulfilled' ? unwrapRows(teachersResponse.value) : [];
      setTeachers(fetchedTeachers.length > 0 ? fetchedTeachers : FALLBACK_TEACHERS);
      const fetchedSpaces = spacesResponse.status === 'fulfilled' ? unwrapRows(spacesResponse.value) : [];
      setSpaces(fetchedSpaces.length > 0 ? fetchedSpaces : FALLBACK_SPACES);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setTeachers(FALLBACK_TEACHERS);
      setSpaces(FALLBACK_SPACES);
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSavedAssignees = useCallback(async (spaceId) => {
    if (!spaceId) {
      setSavedAssignees([]);
      return;
    }

    try {
      const response = await getAdminSpaceHeads(spaceId);
      setSavedAssignees(unwrapRows(response));
    } catch (error) {
      console.error('Failed to load space heads:', error);
      toast.error('Failed to load space heads.');
      setSavedAssignees([]);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadSavedAssignees(viewSpaceId);
  }, [viewSpaceId, loadSavedAssignees]);

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;

    if (name === 'category') {
      setFormState((current) => ({
        ...current,
        category: value,
        spaceId: '',
        department: '',
        teacherId: '',
      }));
      return;
    }


    if (name === 'department') {
      setFormState((current) => ({
        ...current,
        department: value,
        teacherId: '',
      }));
      return;
    }

    setFormState((current) => {
      const next = { ...current, [name]: value };

      return next;
    });
  }, []);

  const handleAssign = useCallback(async () => {
    const { category, spaceId, department, teacherId } = formState;

    if (!category || !spaceId || !department || !teacherId) {
      return;
    }

    const teacher = teachers.find((item) => item.id === teacherId);
    const spacePool = spaces.length > 0 ? spaces : FALLBACK_SPACES;
    const space = spacePool.find((item) => item.id === spaceId || item.name === spaceId);
    const spaceReference = space ? (isFallbackSpaceId(space.id) ? space.name : space.id) : spaceId;

    if (!teacher || !space) {
      return;
    }

    if (normalizeDepartment(teacher.department) !== normalizeDepartment(department)) {
      toast.error('Please choose a teacher from the selected department.');
      return;
    }

    const duplicateSaved = savedAssignees.some(
      (row) =>
        (row.space_id === spaceReference || normalizeDepartment(row.space?.name) === normalizeDepartment(space?.name)) &&
        row.teacher?.id === teacherId &&
        row.is_active !== false &&
        !row.removed_date
    );

    if (duplicateSaved) {
      toast.error('This teacher is already assigned to that space.');
      return;
    }

    try {
      const response = await assignAdminSpaceHead({
        space_id: isFallbackSpaceId(space.id) ? '' : space.id || '',
        space_name: space.name,
        teacher_id: teacher.id,
      });

      const assignedRow = response?.data || null;
      if (assignedRow) {
        setSavedAssignees((current) => [
          assignedRow,
          ...current.filter((row) => row.id !== assignedRow.id),
        ]);
      } else {
        await loadSavedAssignees(spaceReference);
      }

      toast.success('Assigned successfully');
      setFormState((current) => ({
        ...current,
        teacherId: '',
      }));
    } catch (error) {
      console.error('Failed to assign space head:', error);
      toast.error('Assign failed. Try again.');
    }
  }, [formState, loadSavedAssignees, savedAssignees, spaces, teachers]);

  const handleRemoveSaved = useCallback(async (id) => {
    try {
      const response = await removeAdminSpaceHead(id);
      const updatedRow = response?.data || null;
      const removedAt = updatedRow?.removed_date || new Date().toISOString();

      setSavedAssignees((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                removed_date: removedAt,
                is_active: false,
                ...(updatedRow || {}),
              }
            : row
        )
      );

      toast.success('Marked as removed');
    } catch (error) {
      console.error('Failed to remove space head:', error);
      toast.error('Remove failed. Try again.');
    }
  }, []);

  const handleDeleteForever = useCallback(async (id) => {
    try {
      await deleteAdminSpaceHeadForever(id);
      setSavedAssignees((current) => current.filter((row) => row.id !== id));
      toast.success('Deleted forever');
    } catch (error) {
      console.error('Failed to delete space head forever:', error);
      toast.error('Delete failed. Try again.');
    }
  }, []);

  const handleViewCategoryChange = useCallback((category) => {
    setViewCategory(category);
    setViewSpaceId('');
  }, []);

  const handleViewSpaceChange = useCallback((spaceId) => {
    setViewSpaceId(spaceId);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <Loader2 className="animate-spin text-indigo-600" size={20} />
          <div>
            <p className="text-sm font-semibold text-primary">Loading admin workspace</p>
            <p className="text-xs text-secondary">Fetching spaces and teachers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="mx-auto max-w-[860px] px-4 pb-14 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <ShieldCheck size={12} />
              Admin Panel
            </div>
            <h1 className="mt-4 font-sora text-[26px] font-semibold tracking-tight text-primary">
              Space Head Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-secondary">
              Assign and manage responsible heads for each space.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-secondary shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-[0_10px_24px_rgba(79,70,229,0.12)] active:translate-y-0"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                ←
              </span>
              Back
            </Link>

            {selectedSpace ? (
              <div className="hidden rounded-2xl border border-gray-100 bg-white px-4 py-3 text-right shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">Selected Space</p>
                <p className="mt-1 text-sm font-semibold text-primary">{selectedSpace.name}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <AssignForm
            formState={formState}
            teachers={teachers}
            spaces={spaces}
            onChange={handleFormChange}
            onAssign={handleAssign}
            disabled={!teachers.length || !spaces.length}
          />

          <AssigneesTable
            spaceId={viewSpaceId}
            category={viewCategory}
            onCategoryChange={handleViewCategoryChange}
            onSpaceChange={handleViewSpaceChange}
            spaces={spaces}
            savedRows={savedAssignees}
            onRemove={handleRemoveSaved}
            onDeleteForever={handleDeleteForever}
          />

        </div>
      </div>
    </div>
  );
};

export default SpaceHeads;
