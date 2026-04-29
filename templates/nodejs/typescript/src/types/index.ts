import type { IncomingMessage } from "node:http";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface RequestWithBody<T = unknown> extends IncomingMessage {
  body?: T;
}
