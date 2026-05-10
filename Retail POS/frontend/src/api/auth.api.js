import client from "./client";

export const loginUser = async (payload) => {
  const { data } = await client.post("/auth/login", payload);
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await client.post("/auth/register", payload);
  return data;
};