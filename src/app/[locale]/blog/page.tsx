"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${locale}#blog`);
  }, [router, locale]);
  return null;
}
