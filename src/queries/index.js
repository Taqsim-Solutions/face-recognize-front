import { getUsers, getRoles } from "../api";

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
