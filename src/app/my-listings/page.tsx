import { redirect } from "next/navigation";

export default function MyListingsPage() {
  redirect('/?tab=rentals&rentalsTab=my_listings');
}
