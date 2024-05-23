import {
  getUsers,
  getCustomers,
  getTeachers,
  getClasses,
  getSchools,
  getRegions,
  getMe,
  getStudents,
  getGovernment,
  getAttendances,
  getPerformance,
  getSchoolsOverview,
  getDashboardAbsents,
  getDashboardOverview,
  getOverallStatistics,
  getFaces,
  getUnknownFaces,
  getSchoolNumbers,
} from "../api";

export function getUsersQuery(params) {
  return {
    queryKey: ["users", params],
    queryFn: async () => getUsers(params),
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

export function getMeQuery() {
  return {
    queryKey: ["me"],
    queryFn: async () => getMe(),
  };
}

export function getStudentsQuery(params) {
  return {
    queryKey: ["students", params],
    queryFn: async () => getStudents(params),
  };
}

export function getPerformanceQuery(params) {
  return {
    queryKey: ["performance", params],
    queryFn: async () => getPerformance(params),
  };
}

export function getSchoolNumbersQuery() {
  return {
    queryKey: ["school-numbers"],
    queryFn: async () => getSchoolNumbers(),
  };
}

export function geSchoolOverviewQuery(params) {
  return {
    queryKey: ["school-overview", params],
    queryFn: async () => getSchoolsOverview(params),
  };
}

export function getGovernmentsQuery() {
  return {
    queryKey: ["governments"],
    queryFn: async () => getGovernment(),
  };
}

export function getAttendancesQuery(date) {
  return {
    queryKey: ["attendances", date],
    queryFn: async () => getAttendances(date),
  };
}

export function getDashboardAbsentsQuery(params) {
  return {
    queryKey: ["absents-dashbord", params],
    queryFn: async () => getDashboardAbsents(params),
  };
}

export function getDashboardOverviewQuery(params) {
  return {
    queryKey: ["overview-dashbord", params],
    queryFn: async () => getDashboardOverview(params),
  };
}

export function getOverallStatisticsQuery(params) {
  return {
    queryKey: ["overall-dashbord", params],
    queryFn: async () => getOverallStatistics(params),
  };
}

export function getFacesQuery(params) {
  return {
    queryKey: ["faces", params],
    queryFn: async () => getFaces(params),
  };
}

export function getUnknownFacesQuery(params) {
  return {
    queryKey: ["unknown-faces", params],
    queryFn: async () => getUnknownFaces(params),
  };
}
