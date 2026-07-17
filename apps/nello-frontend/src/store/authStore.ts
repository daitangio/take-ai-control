import { create } from 'zustand'

interface AuthState {
  email: string | null
  jwt: string | null
  login: (email: string, jwt: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  jwt: localStorage.getItem('nello_jwt'),
  login: (email, jwt) => {
    localStorage.setItem('nello_jwt', jwt)
    set({ email, jwt })
  },
  logout: () => {
    localStorage.removeItem('nello_jwt')
    set({ email: null, jwt: null })
  },
}))
