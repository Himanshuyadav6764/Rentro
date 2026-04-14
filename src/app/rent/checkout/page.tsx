import RentCheckoutView from "@/components/views/RentCheckoutView";

type CheckoutSearchParams = {
  [key: string]: string | string[] | undefined;
};

type CheckoutPageProps = {
  searchParams: Promise<CheckoutSearchParams>;
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function RentCheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const itemId = getSingleValue(params.itemId);

  return <RentCheckoutView itemId={itemId} />;
}
