import { useMutation } from "@tanstack/vue-query";
import { createPayments } from "../api";
import type { PayloadPayments } from "../types";

export const useCreatePayments = () => {
  return useMutation({
    mutationFn: (data: PayloadPayments) => createPayments(data),
  });
};
