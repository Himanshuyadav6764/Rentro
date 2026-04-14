"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductDetailView from "@/components/views/ProductDetailView";

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();

  const listingId = useMemo(() => {
    const rawId = params?.id;
    return Array.isArray(rawId) ? rawId[0] : rawId;
  }, [params]);

  return (
    <div className="h-screen w-full bg-[#f8faff] overflow-hidden">
      <ProductDetailView
        productId={listingId}
        onBack={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }

          router.push("/");
        }}
      />
    </div>
  );
}
