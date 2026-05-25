import api from '@/api'

export const fetchTodayStats = async (params: {
  regionId?: number
  cityId?: number
  schoolId?: number
}) => {
  const p: Record<string, any> = {}
  if (params.regionId) p.RegionId = params.regionId
  if (params.cityId) p.CityId = params.cityId
  if (params.schoolId) p.SchoolId = params.schoolId
  return await api.get('/api/dashboard/today-stats', { params: p })
}
