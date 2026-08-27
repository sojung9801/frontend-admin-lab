import type { User } from "../model/user";

type DemoUser = User & {
  password: string;
};

const demoUsers: DemoUser[] = [
  {
    id: "admin-1",
    email: "admin@example.com",
    name: "Admin",
    password: "admin1234",
    role: "admin",
  },
  {
    id: "viewer-1",
    email: "viewer@example.com",
    name: "Viewer",
    password: "viewer1234",
    role: "viewer",
  },
];

function toUser(demoUser: DemoUser): User {
  return {
    id: demoUser.id,
    email: demoUser.email,
    name: demoUser.name,
    role: demoUser.role,
  };
}

export function authenticateUser(email: string, password: string) {
  const demoUser = demoUsers.find(
    (user) =>
      user.email === email.trim().toLowerCase() && user.password === password,
  );

  return demoUser ? toUser(demoUser) : null;
}

export function findUserById(userId: string) {
  const demoUser = demoUsers.find((user) => user.id === userId);

  return demoUser ? toUser(demoUser) : null;
}
