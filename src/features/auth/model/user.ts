export type UserRole = "admin" | "viewer";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};
