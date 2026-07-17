import { api } from './client'

export const authApi = {
  requestLink: (email: string) => api.post('/auth/request-link', { email }),
  verifyToken: (token: string): Promise<{ jwt: string }> =>
    api.post('/auth/verify-token', { token }),
}
