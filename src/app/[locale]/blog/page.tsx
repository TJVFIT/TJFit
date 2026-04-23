"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BlogPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}#blog`);
  }, [router, params.locale]);
  return null;
}
