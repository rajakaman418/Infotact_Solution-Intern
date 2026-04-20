import client from "./client";

export const getProducts = async (params = {}) => {
  const { data } = await client.get("/products", { params });
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await client.post("/products", payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await client.patch(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await client.delete(`/products/${id}`);
  return data;
};