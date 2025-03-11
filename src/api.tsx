import { User } from "./types/types";
import axios from "axios";

const getAllUsers = async (): Promise<User[]> => {
  const response = await axios.get("/db.json");
  return response.data.users;
};

const postUser = (user: Omit<User, "id">): Promise<User> => {
  return new Promise<User>((resolve) => {
    const newUser = {
      ...user,
      id: localStorage.length + 1,
      password: "defaultPassword",
      glucoseEntries: [],
      foodEntries: [],
    } as User;
    localStorage.setItem(newUser.email, JSON.stringify(newUser));
    resolve(newUser);
  });
};

const deleteUserRequest = (email: string) => {
  return new Promise<void>((resolve, reject) => {
    if (localStorage.getItem(email)) {
      localStorage.removeItem(email);
      resolve();
    } else {
      reject(new Error("Couldn't delete user"));
    }
  });
};

const patchUser = (user: Partial<User>, email: string) => {
  return new Promise<void>((resolve, reject) => {
    const existingUser = JSON.parse(localStorage.getItem(email) || "{}");
    if (existingUser) {
      const updatedUser = { ...existingUser, ...user };
      localStorage.setItem(email, JSON.stringify(updatedUser));
      resolve();
    } else {
      reject(new Error("User didn't patch"));
    }
  });
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await getAllUsers();
  return users.find((user) => user.email === email) || null;
};

export const Requests = {
  postUser,
  deleteUserRequest,
  patchUser,
  getAllUsers,
  getUserByEmail,
};
