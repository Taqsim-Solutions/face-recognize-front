type OrganizationImage = {
  id: string
  type: string
}
type Organization = {
  id: string
  name: string
  tin: string
  images: OrganizationImage[]
}
type Role = {
  id: number
  name: string
}
export type AccountOrganization = {
  organization: Organization
  role: Role
}
export type AccountOrganizationsModel = {
  data: {
    data: AccountOrganization[]
  }
}
