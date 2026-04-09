import useSWR from "swr";

import { useAuth } from "@/components/auth-provider";
import { fetcher } from "@/lib/fetcher";

export function useWallet() {
  const { user } = useAuth();
  return useSWR(
    user ? "/api/coins/wallet" : null,
    fetcher,
    { dedupingInterval: 30000, revalidateOnFocus: false, revalidateOnReconnect: false }
  );
}
