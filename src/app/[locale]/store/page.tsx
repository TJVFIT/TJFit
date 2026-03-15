import { ProductCard, SectionHeading } from "@/components/ui";
import { products } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function StorePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Equipment Store"
        title="A lightweight ecommerce layer for training and recovery tools."
        copy="The store supports resistance bands, dumbbells, ropes, foam rollers, massage guns, and future cart/checkout expansion."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {[
          "Cart state and line items",
          "Product detail pages",
          "Checkout routing with PayTR handoff"
        ].map((feature) => (
          <div key={feature} className="glass-panel rounded-[24px] p-5 text-sm text-zinc-300">
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
}
