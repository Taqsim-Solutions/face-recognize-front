/* eslint-disable no-param-reassign */
import axios from "axios";
import settings from "../settings/settings";

const request = axios.create({
  baseURL: settings.baseURL,
  timeout: settings.requestTimeout,
});

export function errorHandler(error) {
  if (error.response) {
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }
    return Promise.reject(error.response);
  }
  if (error.request) {
    return Promise.reject(error.request);
  }
  return Promise.reject(error);
}

request.defaults.headers.timezone = new Date().getTimezoneOffset();
request.defaults.headers["Accept-Language"] =
  localStorage.getItem("lang") ?? "ru";
request.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
request.defaults.headers["Access-Control-Allow-Origin"] = "*";

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, errorHandler);

request.interceptors.response.use((response) => {
  return response.data;
}, errorHandler);

export default request;
