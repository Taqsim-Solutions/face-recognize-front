// Lifecycle status shared by users, regions, cities, schools, teachers and
// students. Mirrors the backend EntityStatus enum.
export const EntityStatus = {
  Active: 1,
  Inactive: 2,
  Deleted: 3
} as const

export type EntityStatusValue = (typeof EntityStatus)[keyof typeof EntityStatus]

// Apostrophe-free Uzbek fallbacks (safe inside t() and template bindings).
export const STATUS_LABEL: Record<number, string> = {
  1: 'Faol',
  2: 'Vaqtincha',
  3: 'Ochirilgan'
}

// Tailwind classes for the badge per status.
export const STATUS_BADGE_CLASS: Record<number, string> = {
  1: 'bg-[#E8F5E9] text-[#2E7D32]',
  2: 'bg-[#FFF4E5] text-[#B26A00]',
  3: 'bg-[#FDECEA] text-[#C62828]'
}

// Options for a status filter dropdown (includes an "all" entry).
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', labelKey: 'status-all', labelFallback: 'Barchasi' },
  { value: '1', labelKey: 'status-active', labelFallback: 'Faol' },
  { value: '2', labelKey: 'status-inactive', labelFallback: 'Vaqtincha' },
  { value: '3', labelKey: 'status-deleted', labelFallback: 'Ochirilgan' }
]
