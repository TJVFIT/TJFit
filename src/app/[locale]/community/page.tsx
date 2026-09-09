"use client";

import { useRouter } from "next/navigation";
import { useEffect, use } from "react";

export default function CommunityPage(props: { params: Promise<{ locale: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}#community`);
  }, [router, params.locale]);
  return null;
}
