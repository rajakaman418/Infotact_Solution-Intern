import client from "./client";

export const getSalesReport = async (params = {}) => {
  const { data } = await client.get("/reports/sales", { params });
  return data;
};