import { create } from "zustand";
import { JWT_KEY } from "../api/client";

const EMAIL_KEY = "nello_email";

interface AuthState {
  jwt: string | null;
  email: string | null;
  setAuth: (jwt: string, email: string) => void;
  logout: () => void;
}

const initialJwt = typeof window === "undefined" ? null : window.localStorage.getItem(JWT_KEY);
const initialEmail = typeof window === "undefined" ? null : window.localStorage.getItem(EMAIL_KEY);

export const useAuthStore = create<AuthState>((set) => ({
  jwt: initialJwt,
  email: initialEmail,
  setAuth: (jwt, email) => {
    window.localStorage.setItem(JWT_KEY, jwt);
    window.localStorage.setItem(EMAIL_KEY, email);
    set({ jwt, email });
  },
  logout: () => {
    window.localStorage.removeItem(JWT_KEY);
    window.localStorage.removeItem(EMAIL_KEY);
    set({ jwt: null, email: null });
  }
}));
