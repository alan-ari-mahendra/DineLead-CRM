"use server";

import { cookies } from "next/headers";

export const getCookies = async () => {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  return cookieString;
};
