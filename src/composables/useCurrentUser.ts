import { computed } from 'vue'
import { useGetAccountInfo } from '@/views/account/detail/queries/useGetAccountInfo'

export const useCurrentUser = () => {
  const { data: user } = useGetAccountInfo()

  // Level: 1=teacher, 2=director, 3=district, 4=region, 5=admin
  const level      = computed(() => user.value?.level as number | undefined)
  const regionId   = computed(() => user.value?.region?.id as number | undefined)
  const cityId     = computed(() => user.value?.city?.id as number | undefined)
  const schoolId   = computed(() => user.value?.schoolId as number | undefined)
  const classId    = computed(() => user.value?.classId as number | undefined)

  const isAdmin    = computed(() => level.value === 5)
  const isRegion   = computed(() => level.value === 4)
  const isDistrict = computed(() => level.value === 3)
  const isDirector = computed(() => level.value === 2)
  const isTeacher  = computed(() => level.value === 1)

  // Should region/city/school filters be hidden (auto-applied by backend)
  const hideRegionFilter  = computed(() => !isAdmin.value)
  const hideCityFilter    = computed(() => !isAdmin.value && !isRegion.value)
  const hideSchoolFilter  = computed(() => isDirector.value || isTeacher.value)

  return {
    user, level,
    regionId, cityId, schoolId, classId,
    isAdmin, isRegion, isDistrict, isDirector, isTeacher,
    hideRegionFilter, hideCityFilter, hideSchoolFilter
  }
}
