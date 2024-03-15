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

export const getRoles = () => {
  return request({ method: "GET", url: "/roles" });
};

export const getCustomers = (params) => {
  return request({ method: "GET", url: "/customer", params });
};

export const createCustomer = (data) => {
  return request({ method: "POST", url: "/customer", data });
};
