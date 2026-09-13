"use client";

import { useRouter } from "next/navigation";
import { useEffect, use } from "react";

export default function CoachesPage(props: { params: Promise<{ locale: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}#coaches`);
  }, [router, params.locale]);
  return null;
}
