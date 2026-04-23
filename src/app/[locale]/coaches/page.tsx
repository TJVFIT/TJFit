"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CoachesPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}#coaches`);
  }, [router, params.locale]);
  return null;
}
