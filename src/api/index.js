import request from "../utils/axios";

export const loginAPI = (data) => {
  return request({ method: "POST", url: "/authentication", data });
};

export const getUsers = () => {
  return request({ method: "GET", url: "/users" });
};

export const createUser = (data) => {
  return request({ method: "POST", url: "/users", data });
};

export const editUser = (data, id) => {
  return request({ method: "PUT", url: `/users/${id}`, data });
};

export const deleteUser = (id) => {
  return request({ method: "DELETE", url: `/users/${id}` });
};

export const getCustomers = (params) => {
  return request({ method: "GET", url: "/customer", params });
};

export const createCustomer = (data) => {
  return request({ method: "POST", url: "/customer", data });
};

export const getTeachers = (data) => {
  return request({ method: "GET", url: "/teachers", data });
};

export const getClasses = (params) => {
  return request({ method: "GET", url: "/classes", params });
};

export const getSchools = (params) => {
  return request({ method: "GET", url: "/schools", params });
};

export const createTeacher = (data) => {
  return request({ method: "POST", url: "/teachers", data });
};

export const updateTeacher = (data, id) => {
  return request({ method: "PUT", url: `/teachers/${id}`, data });
};

export const getTeacher = (id) => {
  return request({ method: "GET", url: `/teachers/${id}` });
};

export const deleteTeacher = (id) => {
  return request({ method: "DELETE", url: `/teachers/${id}` });
};

export const getRegions = () => {
  return request({ method: "GET", url: "/regions" });
};

export const createSchool = (data) => {
  return request({ method: "POST", url: "/schools", data });
};

export const editSchool = (data, id) => {
  return request({ method: "PUT", url: `/schools/${id}`, data });
};

export const deleteSchool = (id) => {
  return request({ method: "DELETE", url: `/schools/${id}` });
};
