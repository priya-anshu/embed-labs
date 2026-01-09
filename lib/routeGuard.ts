import { fakeAuth } from "./fakeAuth";

export function requireAuth() {
  return fakeAuth.isLoggedIn;
}

export function requireAdmin() {
  return fakeAuth.isLoggedIn && fakeAuth.role === "admin";
}
