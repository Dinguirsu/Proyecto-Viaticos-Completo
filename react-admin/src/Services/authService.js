import authApi from "./authApi";

export const loginMembership = async ({ username, password }) => {
  try {
    const response = await authApi.post("/auth/login-membership", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw error; // se maneja en Login.jsx
  }
};
