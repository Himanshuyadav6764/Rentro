import { redirect } from "next/navigation";

type MyRentalsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function MyRentalsPage({ searchParams }: MyRentalsPageProps) {
  const params = await searchParams;

  if (params.tab === "my-listings") {
    redirect('/?tab=rentals&rentalsTab=my_listings');
  }

  redirect('/?tab=rentals&rentalsTab=my_rentals');
}
