import React from 'react';
import { Building2, ChevronDown, Trash2, Users } from 'lucide-react';

const typeBadge = (type) => {
  if (type === 'hostel') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-indigo-50 text-indigo-700 border-indigo-200';
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

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

const normalize = (value) => String(value || '').trim().toUpperCase();
const isFallbackSpaceId = (value) => String(value || '').startsWith('fallback-');
const getSpaceValue = (space) => (space.id && !isFallbackSpaceId(space.id) ? space.id : space.name);

const TableRow = ({
  row,
  isActive,
  isPending,
  isRemoved,
  onRemove,
  onRemovePending,
  onDeleteForever,
  pendingIndex,
}) => {
  const teacher = row.teacher || {};
  const space = row.space || {};

  return (
    <tr className={`border-t border-gray-100 transition-colors ${isPending ? 'bg-amber-50/30' : ''}`}>
      <td className="px-4 py-4 align-top">
        <div className={isActive ? 'text-sm font-semibold text-primary' : 'text-sm font-semibold text-secondary line-through'}>
          {teacher.name || 'Unknown'}
        </div>
        <div className="mt-1 text-xs text-secondary">{teacher.email || 'No email'}</div>
      </td>
      <td className="px-4 py-4 align-top text-sm text-secondary">
        {teacher.department || '—'}
      </td>
      <td className="px-4 py-4 align-top">
        <div className="text-sm font-medium text-primary">{space.name || '—'}</div>
        <span className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${typeBadge(space.type)}`}>
          {space.type || '—'}
        </span>
      </td>
      <td className="px-4 py-4 align-top">
        <span className="text-sm text-secondary">{formatDate(row.assigned_date)}</span>
      </td>
      <td className="px-4 py-4 align-top text-sm text-secondary">
        {row.removed_date ? formatDate(row.removed_date) : '—'}
      </td>
      <td className="px-4 py-4 align-top">
        {isPending ? (
          <button
            type="button"
            onClick={() => onRemovePending(pendingIndex)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-500 transition-all duration-150 ease-out hover:bg-red-50"
          >
            <Trash2 size={14} />
            Remove
          </button>
        ) : isRemoved ? (
          <button
            type="button"
            onClick={() => onDeleteForever(row.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition-all duration-150 ease-out hover:bg-red-50"
          >
            <Trash2 size={14} />
            Delete forever
          </button>
        ) : isActive ? (
          <button
            type="button"
            onClick={() => onRemove(row.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-500 transition-all duration-150 ease-out hover:bg-red-50"
          >
            <Trash2 size={14} />
            Remove
          </button>
        ) : (
          <span className="text-sm text-secondary">—</span>
        )}
      </td>
    </tr>
  );
};

const AssigneesTable = ({
  spaceId,
  category = '',
  spaces = [],
  pendingRows = [],
  savedRows = [],
  onRemove,
  onDeleteForever,
  onRemovePending,
  onCategoryChange,
  onSpaceChange,
}) => {
  const categoryOptions = CATEGORY_OPTIONS;
  const activeCategory = category || '';
  const allowedNames = CATEGORY_SPACE_MAP[activeCategory] || [];
  const allowed = new Set(allowedNames.map(normalize));
  const sourceSpaces = Array.isArray(spaces) && spaces.length > 0 ? spaces : FALLBACK_SPACES;
  const filteredSpaces = activeCategory
    ? sourceSpaces.filter(
        (space) => normalize(space.type) === normalize(activeCategory) || allowed.has(normalize(space.name))
      )
    : [];

  const combinedRows = [
    ...pendingRows.map((row, pendingIndex) => ({ ...row, __pending: true, pendingIndex })),
    ...savedRows.map((row) => ({ ...row, __pending: false })),
  ].filter(
    (row) =>
      (!activeCategory || normalize(row.space?.type || row.space_type) === normalize(activeCategory)) &&
      (!spaceId || row.space_id === spaceId || normalize(row.space?.name || '') === normalize(spaceId))
  );

  return (
    <div className="rounded-2xl bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Users size={18} />
        </div>
        <div>
          <h2 className="text-[22px] font-semibold text-primary">Assignees</h2>
          <p className="text-sm text-secondary">Manage active, pending, and removed heads.</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
            Category
          </label>
          <div className="relative">
            <select
              value={activeCategory}
              onChange={(event) => onCategoryChange?.(event.target.value)}
              className="h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 pr-10 text-sm text-primary outline-none transition-all duration-150 ease-out focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
            >
              <option value="">Select category</option>
              {categoryOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
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
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
            Space
          </label>
          <div className="relative">
            <select
              value={spaceId}
              onChange={(event) => onSpaceChange?.(event.target.value)}
              className="h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 pr-10 text-sm text-primary outline-none transition-all duration-150 ease-out focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              disabled={!activeCategory}
            >
              <option value="">{activeCategory ? 'Select space' : 'Pick a category first'}</option>
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
      </div>

      {!spaceId ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-secondary">
          Select a space to view assignees.
        </div>
      ) : combinedRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-secondary">
          No heads assigned yet for this space.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    Assignee
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    Space
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    Assigned Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    Removed Date
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {combinedRows.map((row) => {
                  const isPending = Boolean(row.__pending);
                  const isActive = isPending ? true : row.is_active !== false && !row.removed_date;
                  const isRemoved = !isPending && row.removed_date && row.is_active === false;

                  return (
                    <TableRow
                      key={isPending ? row.pendingKey : row.teacher?.id || row.teacher_id || row.id}
                      row={row}
                      isPending={isPending}
                      isActive={isActive}
                      isRemoved={isRemoved}
                      pendingIndex={isPending ? row.pendingIndex : -1}
                      onRemove={onRemove}
                      onRemovePending={onRemovePending}
                      onDeleteForever={onDeleteForever}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssigneesTable;
