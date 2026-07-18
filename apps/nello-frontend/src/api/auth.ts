import { apiFetch } from "./client";

export interface RequestLinkResponse {
  mockToken?: string;
  message?: string;
}

export interface VerifyTokenResponse {
  jwt: string;
  email: string;
}

export const requestMagicLink = (email: string) =>
  apiFetch<RequestLinkResponse>("/auth/request-link", {
    method: "POST",
    body: JSON.stringify({ email })
  });

export const verifyMagicToken = (token: string) =>
  apiFetch<VerifyTokenResponse>("/auth/verify-token", {
    method: "POST",
    body: JSON.stringify({ token })
  });
