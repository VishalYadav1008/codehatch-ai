import { create } from "zustand";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const useAuthStore = create((set) => ({
  user: null,
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user });
    } catch (error) {
      console.error("Login error:", error.message);
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  },
}));

export default useAuthStore;
