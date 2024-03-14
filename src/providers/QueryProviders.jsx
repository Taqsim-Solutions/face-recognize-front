import { QueryClientProvider } from "@tanstack/react-query";
import SingleQueryClient from "../classes/SingleQueryClient";

const queryClient = SingleQueryClient.getInstance();

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
