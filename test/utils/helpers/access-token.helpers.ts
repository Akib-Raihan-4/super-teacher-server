import { HttpStatus } from "@nestjs/common";

import request from "supertest";

import { THttpServer } from "../types";

export async function getAccessToken(
  httpServer: THttpServer,
  email: string,
  password: string,
): Promise<string> {
  const response = await request(httpServer).post("/auth/login").send({ email, password });

  if (response.status !== HttpStatus.CREATED) {
    throw new Error(`Login failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  if (!response.body.token) {
    throw new Error(`Token not found in response: ${JSON.stringify(response.body)}`);
  }

  return response.body.token;
}
