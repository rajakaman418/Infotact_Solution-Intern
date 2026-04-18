import client from "./client";

export const addStock = async (payload) => {
  const { data } = await client.post("/inventory/add", payload);
  return data;
};

export const getStock = async (params = {}) => {
  const { data } = await client.get("/inventory/stock", { params });
  return data;
};