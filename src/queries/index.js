import {
  getUsers,
  getCustomers,
  getTeachers,
  getClasses,
  getSchools,
  getRegions,
} from "../api";

export function getUsersQuery() {
  return {
    queryKey: ["users"],
    queryFn: async () => getUsers(),
  };
}

export function getCustomersQuery(params) {
  return {
    queryKey: ["customers", params],
    queryFn: async () => getCustomers(params),
  };
}

export function getTeachersQuery(params) {
  return {
    queryKey: ["teachers", params],
    queryFn: async () => getTeachers(params),
  };
}

export function getClassesQuery(params) {
  return {
    queryKey: ["classes", params],
    queryFn: async () => getClasses(params),
  };
}

export function getSchoolsQuery(params) {
  return {
    queryKey: ["schools", params],
    queryFn: async () => getSchools(params),
  };
}

export function getRegionsQuery(params) {
  return {
    queryKey: ["regions", params],
    queryFn: async () => getRegions(params),
  };
}
