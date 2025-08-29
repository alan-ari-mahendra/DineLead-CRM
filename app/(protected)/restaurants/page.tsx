import { getCookies } from "@/app/action";
import axios from "axios";
import { notFound } from "next/navigation";
import RestaurantComponent from "@/components/restaurants/restaurantComponent";

const getRestaurantData = async (page: number = 1, limit: number = 15) => {
  try {
    const cookieString = await getCookies();
    const response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/restaurant?page=${page}&limit=${limit}`,
      {
        headers: {
          Cookie: cookieString,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch scraping jobs:", error);
    notFound();
  }
};

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const data = await getRestaurantData(page);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Restaurant Management
        </h1>
        <p className="text-gray-600">
          Manage and track your restaurant leads and contacts.
        </p>
      </div>

      <RestaurantComponent restaurant={data.data} metaPagination={data.meta} />
    </div>
  );
}
