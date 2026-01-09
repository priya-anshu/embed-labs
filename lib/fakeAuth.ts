export type Role = "user" | "admin";

export const fakeAuth = {
  isLoggedIn: true, // toggle manually
  role: "user" as Role, // change to "admin"
};
