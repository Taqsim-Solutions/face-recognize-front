import { getUsers, getRoles, getCustomers } from "../api";

export function getUsersQuery() {
  return {
    queryKey: ["users"],
    queryFn: async () => getUsers(),
  };
}

export function getRolesQuery() {
  return {
    queryKey: ["roles"],
    queryFn: async () => getRoles(),
  };
}

export function getCustomersQuery(params) {
  return {
    queryKey: ["customers", params],
    queryFn: async () => getCustomers(params),
  };
}
