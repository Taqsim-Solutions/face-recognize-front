import request from "../utils/axios";

export const loginAPI = (data) => {
  return request({ method: "POST", url: "/api/authentication", data });
};

export const getUsers = (params) => {
  return request({ method: "GET", url: "/api/users", params });
};

export const getPerformance = (params) => {
  return request({ method: "GET", url: "/api/dashboard/performance", params });
};

export const getSchoolsOverview = (params) => {
  return request({ method: "GET", url: "/api/dashboard/school-details", params });
};

export const createUser = (data) => {
  return request({ method: "POST", url: "/api/users", data });
};

export const editUser = (data, id) => {
  return request({ method: "PUT", url: `/api/users/${id}`, data });
};

export const deleteUser = (id) => {
  return request({ method: "DELETE", url: `/api/users/${id}` });
};

export const getCustomers = (params) => {
  return request({ method: "GET", url: "/api/customer", params });
};

export const createCustomer = (data) => {
  return request({ method: "POST", url: "/api/customer", data });
};

export const getTeachers = (params) => {
  return request({ method: "GET", url: "/api/teachers", params });
};

export const getClasses = (params) => {
  return request({ method: "GET", url: "/api/classes", params });
};

export const getSchools = (params) => {
  return request({ method: "GET", url: "/api/schools", params });
};

export const createTeacher = (data) => {
  return request({ method: "POST", url: "/api/teachers", data });
};

export const updateTeacher = (data, id) => {
  return request({ method: "PUT", url: `/api/teachers/${id}`, data });
};

export const updateTeacherPassword = (password, id) => {
  return request({
    method: "PUT",
    url: `/api/users/password/${id}?newPassword=${password}`,
  });
};

export const getTeacher = (id) => {
  return request({ method: "GET", url: `/api/teachers/${id}` });
};

export const deleteTeacher = (id) => {
  return request({ method: "DELETE", url: `/api/teachers/${id}` });
};

export const getRegions = () => {
  return request({ method: "GET", url: "/api/regions" });
};

export const createSchool = (data) => {
  return request({ method: "POST", url: "/api/schools", data });
};

export const editSchool = (data, id) => {
  return request({ method: "PUT", url: `/api/schools/${id}`, data });
};

export const deleteSchool = (id) => {
  return request({ method: "DELETE", url: `/api/schools/${id}` });
};

export const getMe = () => {
  return request({ method: "GET", url: "/api/users/get-me" });
};

export const getStudents = (params) => {
  return request({ method: "GET", url: "/api/students", params });
};

export const getStudent = (id) => {
  return request({ method: "GET", url: `/api/students/${id}` });
};

export const deleteStudent = (id) => {
  return request({ method: "DELETE", url: `/api/students/${id}` });
};

export const deleteUnknownImage = (id) => {
  return request({
    method: "DELETE",
    url: `/api/face-recognitons/unknown-faces/${id}`,
  });
};

export const editStudent = (data, id) => {
  return request({ method: "PUT", url: `/api/students/${id}`, data });
};

export const createStudent = (data) => {
  return request({ method: "POST", url: "/api/students", data });
};

export const createGovernment = (data) => {
  return request({ method: "POST", url: "/api/governments", data });
};

export const updateGovernment = (data, id) => {
  return request({ method: "PUT", url: `/api/governments/${id}`, data });
};

export const studentParent = (id, data) => {
  return request({ method: "PUT", url: `/api/students/${id}/parent`, data });
};

export const deleteGovernment = (id) => {
  return request({ method: "DELETE", url: `/api/governments/${id}` });
};

export const getDashboardOverview = (params) => {
  return request({ method: "GET", url: "/api/dashboard/overview", params });
};

export const getGovernment = (params) => {
  return request({ method: "GET", url: "/api/governments", params });
};

export const getSchoolNumbers = (params) => {
  return request({ method: "GET", url: "/api/dashboard/schools-number", params });
};

export const changeMainImage = (id, imageName) => {
  return request({
    method: "PUT",
    url: `/api/students/${id}/photo/main?mainPhotoName=${imageName}`,
  });
};

export const changeTeacherMainImage = (id, imageName) => {
  return request({
    method: "PUT",
    url: `/api/users/${id}/photo/main?mainPhotoName=${imageName}`,
  });
};

export const getFaces = (params) => {
  return request({
    method: "GET",
    url: "/api/face-recognitons/face-images",
    params,
  });
};

export const getUnknownFaces = (params) => {
  return request({
    method: "GET",
    url: "/api/face-recognitons/unknown-faces",
    params,
  });
};

export const getOverallStatistics = (params) => {
  return request({
    method: "GET",
    url: "/api/dashboard/overall-statistics",
    params,
  });
};

export const deleteUserPhoto = (id) => {
  return request({ method: "DELETE", url: `/api/users/photo/${id}` });
};

export const deleteStudentPhoto = (id) => {
  return request({ method: "DELETE", url: `/api/students/photo/${id}` });
};

export const uploadPhoto = (data, id) => {
  return request({
    method: "POST",
    url: `/api/users/photo/${id}`,
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadStudentPhoto = (data, id) => {
  return request({
    method: "POST",
    url: `/api/students/${id}/photo`,
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAttendances = (date) => {
  return request({ method: "GET", url: `/api/Attendances/date/${date}` });
};

export const getAttendancesDetail = (date, classId) => {
  return request({
    method: "GET",
    url: `/api/Attendances/date/${date}/class/${classId}`,
  });
};

export const getDashboardAbsents = (params) => {
  return request({ method: "GET", url: "/api/dashboard/absents", params });
};
