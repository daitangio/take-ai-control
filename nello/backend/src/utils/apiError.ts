import type { FastifyReply } from "fastify";
import type { ErrorCodeValue } from "../types/errors.js";

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  errorCode: ErrorCodeValue,
  detail: string,
) {
  return reply.code(statusCode).send({
    error_code: errorCode,
    detail,
  });
}
