"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DietsPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}#diets`);
  }, [router, params.locale]);
  return null;
}
