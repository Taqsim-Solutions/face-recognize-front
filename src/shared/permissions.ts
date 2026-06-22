import api from '@/api'

// Built-in defaults — used until/unless the admin overrides them in the DB.
// Page key (route name) → list of Level values (1=teacher … 5=admin) allowed.
export const defaultPagePermissions: Record<string, number[]> = {
  'home': [1, 2, 3, 4, 5],
  'students-list': [1, 2, 3, 4, 5],
  'attendances-list': [1, 2, 3, 4, 5],
  'absences': [1, 2, 3, 4, 5],
  'reports': [1, 2, 3, 4, 5],
  'help': [1, 2, 3, 4, 5],
  'unknown-faces': [1, 2, 3, 4, 5],
  'teachers-list': [2, 3, 4, 5],
  'schools-list': [3, 4, 5],
  'governments-list': [4, 5],
  'premium': [5],
  'users-list': [5],
  'organization-settings': [5]
}

const STORAGE_KEY = 'page_permissions'

// Effective matrix = defaults overlaid with any DB overrides cached locally.
export function getEffectivePermissions(): Record<string, number[]> {
  let override: Record<string, number[]> = {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) override = JSON.parse(raw) || {}
  } catch {
    override = {}
  }
  return { ...defaultPagePermissions, ...override }
}

export function isPageAllowed(pageKey: string, level: number): boolean {
  const perms = getEffectivePermissions()
  const allowed = perms[pageKey]
  // Unknown page → allow (don't accidentally lock out new pages).
  if (!allowed) return true
  return allowed.includes(level)
}

export const fetchPagePermissions = async () => {
  return await api.get<{ result: Record<string, number[]> }>('/api/settings/page-permissions')
}

export const savePagePermissions = async (matrix: Record<string, number[]>) => {
  return await api.put('/api/settings/page-permissions', matrix)
}

// Pull the DB matrix and cache it (called at app bootstrap / after login).
export async function refreshPagePermissions(): Promise<void> {
  try {
    const res = await fetchPagePermissions()
    const remote = (res as any)?.data?.result || (res as any)?.result || {}
    // Only cache non-empty maps; an empty object means "use defaults".
    if (remote && Object.keys(remote).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remote))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Network/permission error → keep whatever is cached (or defaults).
  }
}
