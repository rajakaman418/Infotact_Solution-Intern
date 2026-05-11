import client from "./client";

export const getProducts = async (params = {}) => {
  const { data } = await client.get("/products", { params });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await client.get(`/products/${id}`);
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await client.post("/products", payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  try {
    const { data } = await client.patch(`/products/${id}`, payload);
    return data;
  } catch (error) {
    if (error?.response?.status === 404 || error?.response?.status === 405) {
      const { data } = await client.put(`/products/${id}`, payload);
      return data;
    }

    throw error;
  }
};

export const archiveProduct = async (id) => {
  return updateProduct(id, { isActive: false });
};

export const unarchiveProduct = async (id) => {
  return updateProduct(id, { isActive: true });
};

export const deleteProduct = async (id) => {
  const { data } = await client.delete(`/products/${id}`);
  return data;
};