import { AxiosResponse } from "axios";
import type { RequestsFetchParams, RequestsResponse } from "../types";

import api from "@/api";

const url = "api/salary-requests";

export const fetchRequests = async (
  params: RequestsFetchParams
): Promise<AxiosResponse> => {
  const response = await api<RequestsResponse>(url, { params });
  return response;
};
