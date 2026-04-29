import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.getMessage(exception, status);

    if (status >= 500) {
      this.logger.error(exception);
    }

    response.status(status).json({
      success: false,
      message
    });
  }

  private getMessage(exception: unknown, status: number) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === "object" && response !== null && "message" in response) {
        const message = (response as { message: string | string[] }).message;
        return Array.isArray(message) ? message.join(", ") : message;
      }

      return exception.message;
    }

    return status === HttpStatus.NOT_FOUND ? "Route not found" : "Internal server error";
  }
}
