import React, { useMemo } from 'react';
import { ChevronDown, Plus, UserPlus } from 'lucide-react';

const selectBase =
  'h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 pr-10 text-sm text-primary outline-none transition-all duration-150 ease-out focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-secondary';

const fieldLabel = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary';

const CATEGORY_OPTIONS = [
  { value: 'department', label: 'Departments' },
  { value: 'hostel', label: 'Hostels' },
  { value: 'facility', label: 'Facilities' },
  { value: 'career', label: 'Career' },
  { value: 'administrative', label: 'Admin' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
];

const CATEGORY_SPACE_MAP = {
  department: [
    'ASD (APPLIED SCIENCE DEPARTMENT)',
    'CSE',
    'ECE',
    'EE',
    'CIVIL',
    'MECHANICAL',
    'CHEMICAL',
    'BIOTECHNOLOGY',
  ],
  hostel: [
    'GOMUKH',
    'NANDA DEVI HOSTEL (NDH)',
    'ARAWALI',
    'KAILASH',
    'NEW BOYS HOSTEL (NBH)',
    'VINDHYACHAL',
    'YAMUNOTRI',
    'GANGOTRI',
  ],
  facility: [
    'LIBRARY',
    'COMPETENCY BUILDING CENTRE',
  ],
  administrative: [
    'ADMINISTRATION BLOCK',
  ],
  career: [
    'TRAINING AND PLACEMENT CELL',
  ],
  sports: [
    'SPORTS DEPT',
    'GYM',
  ],
  cultural: [
    'MULTIPURPOSE THEATRE',
  ],
};

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

const normalize = (value) => String(value || '').trim().toUpperCase();
const isFallbackSpaceId = (value) => String(value || '').startsWith('fallback-');
const getSpaceValue = (space) => (space.id && !isFallbackSpaceId(space.id) ? space.id : space.name);

const normalizeDepartment = (value) => {
  const normalized = normalize(value);
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

const AssignForm = ({
  formState,
  teachers,
  spaces,
  onChange,
  onAssign,
  disabled = false,
}) => {
  const departmentOptions = useMemo(() => {
    return [
      'ASD',
      'CSE',
      'ECE',
      'EE',
      'CIVIL',
      'MECHANICAL',
      'CHEMICAL',
      'BIOTECHNOLOGY',
    ];
  }, []);

  const teacherOptions = useMemo(() => {
    if (!formState.department) {
      return [];
    }

    const teacherPool = Array.isArray(teachers) && teachers.length > 0 ? teachers : FALLBACK_TEACHERS;

    return teacherPool.filter(
      (teacher) => normalizeDepartment(teacher.department) === normalizeDepartment(formState.department)
    );
  }, [teachers, formState.department]);

  const filteredSpaces = useMemo(() => {
    if (!formState.category) {
      return [];
    }

    const allowedNames = CATEGORY_SPACE_MAP[formState.category] || [];
    const allowed = new Set(allowedNames.map(normalize));
    const sourceSpaces = Array.isArray(spaces) && spaces.length > 0 ? spaces : FALLBACK_SPACES;

    const matchingSpaces = sourceSpaces
      .filter((space) => normalize(space.type) === normalize(formState.category) || allowed.has(normalize(space.name)))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (matchingSpaces.length > 0) {
      return matchingSpaces;
    }

    return FALLBACK_SPACES.filter(
      (space) => normalize(space.type) === normalize(formState.category) || allowed.has(normalize(space.name))
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [spaces, formState.category]);

  const isAssignable = formState.spaceId && formState.category && formState.department && formState.teacherId && !disabled;

  return (
    <div className="rounded-2xl bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <UserPlus size={18} />
        </div>
        <div>
          <h2 className="text-[22px] font-semibold text-primary">Assign a Head</h2>
          <p className="text-sm text-secondary">Choose a category, space, and teacher.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className={fieldLabel}>Category</label>
          <div className="relative">
            <select
              name="category"
              value={formState.category}
              onChange={onChange}
              className={selectBase}
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary"
            />
          </div>
        </div>

        <div>
          <label className={fieldLabel}>Space</label>
          <div className="relative">
            <select
              name="spaceId"
              value={formState.spaceId}
              onChange={onChange}
              className={selectBase}
              disabled={!formState.category}
            >
              <option value="">
                {formState.category ? 'Select space' : 'Choose a category first'}
              </option>
              {filteredSpaces.map((space) => (
                <option key={space.id || space.name} value={getSpaceValue(space)}>
                  {space.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary"
            />
          </div>
        </div>

        <div>
          <label className={fieldLabel}>Department</label>
          <div className="relative">
            <select
              name="department"
              value={formState.department}
              onChange={onChange}
              className={selectBase}
              disabled={!formState.spaceId}
            >
              <option value="">
                {formState.spaceId ? 'Pick a dept first' : 'Pick a space first'}
              </option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary"
            />
          </div>
        </div>

        <div>
          <label className={fieldLabel}>Teacher</label>
          <div className="relative">
            <select
              name="teacherId"
              value={formState.teacherId}
              onChange={onChange}
              className={selectBase}
              disabled={!formState.department}
            >
              <option value="">
                {formState.department ? 'Select teacher' : 'Pick a department first'}
              </option>
              {teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.department ? `(${teacher.department})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onAssign}
          disabled={!isAssignable}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-150 ease-out hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          <Plus size={16} />
          Assign
        </button>
      </div>
    </div>
  );
};

export default AssignForm;
