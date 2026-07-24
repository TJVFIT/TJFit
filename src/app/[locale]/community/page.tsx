"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CommunityPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}#community`);
  }, [router, params.locale]);
  return null;
}
