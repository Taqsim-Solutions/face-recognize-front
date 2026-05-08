const settings = {
  baseURL: (process.env.REACT_APP_BASE_URL && process.env.REACT_APP_BASE_URL !== 'undefined') ? process.env.REACT_APP_BASE_URL : "",
  requestTimeout: 60000 * 5,
  rowsPerPage: 10,
  staleTime: 1000 * 60 * 2,
  idleTimeout: 3000,
};

export default settings;
