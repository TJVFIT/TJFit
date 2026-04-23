"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProgramsPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}#programs`);
  }, [router, params.locale]);
  return null;
}
