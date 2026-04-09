import useSWR from "swr";

import { useAuth } from "@/components/auth-provider";
import { fetcher } from "@/lib/fetcher";

export function useNotifications() {
  const { user } = useAuth();
  return useSWR(
    user ? "/api/notifications/pending" : null,
    fetcher,
    { dedupingInterval: 10000, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
}
