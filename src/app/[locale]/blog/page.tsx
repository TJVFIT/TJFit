"use client";

import { useRouter } from "next/navigation";
import { useEffect, use } from "react";

export default function BlogPage(props: { params: Promise<{ locale: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}#blog`);
  }, [router, params.locale]);
  return null;
}
