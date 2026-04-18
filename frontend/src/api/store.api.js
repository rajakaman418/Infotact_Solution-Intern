import client from "./client";

export const getStores = async () => {
  const { data } = await client.get("/stores");
  return data;
};
