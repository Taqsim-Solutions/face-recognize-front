import type { TokenResponse } from '../types'

import { useRouter } from 'vue-router'
import { getAccountOrgs } from '@/views/account/detail/api'
import { getPermissionsQueryOptions } from '@/api/usePermissions'
import { queryClient } from '@/api/vueQuery'

export function useAuthRedirect() {
  const router = useRouter()

  const saveTokenAndRedirect = async ({ accessToken, expireAt, refreshToken }: TokenResponse) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('tokenExpire', expireAt)

    // Clear previous session data from cache
    queryClient.clear()

    try {
      // 1. Fetch organizations for the new session
      const orgsResponse = await queryClient.fetchQuery({
        queryKey: ['account-organizations'],
        queryFn: getAccountOrgs
      })

      // Axios returns response with data, and our API wraps list in data: { data: [...] }
      const organizations = orgsResponse?.data?.data

      if (Array.isArray(organizations) && organizations.length > 0) {
        // 2. Identify current organization (match with existing ID or pick first)
        const storedOrgId = localStorage.getItem('organizationId')
        const matchedOrg = organizations.find(
          (org: any) => org.organization?.id?.toString() === storedOrgId
        )

        const finalOrgId = matchedOrg
          ? matchedOrg.organization.id.toString()
          : organizations[0].organization.id.toString()

        // 3. Set identified organization ID in storage
        localStorage.setItem('organizationId', finalOrgId)

        // 4. Finally fetch permissions for the identified organization
        await queryClient.fetchQuery(getPermissionsQueryOptions())
      }
    } catch (error) {
      console.error('Failed to setup organization context', error)
    } finally {
      // 5. Finalize the redirect
      router.push({ name: 'home' })
    }
  }

  return { saveTokenAndRedirect }
}
