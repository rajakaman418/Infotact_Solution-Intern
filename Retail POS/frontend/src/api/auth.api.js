import client from "./client";

export const loginUser = async (payload) => {
  const { data } = await client.post("/auth/login", payload);
  return data;
};