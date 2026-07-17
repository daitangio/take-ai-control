import { api } from './client'

export const authApi = {
  requestLink: (email: string) => api.post<{ devToken: string | null }>('/auth/request-link', { email }),
  verifyToken: (token: string): Promise<{ jwt: string }> =>
    api.post('/auth/verify-token', { token }),
}
