import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      success: true,
      message: "{{PROJECT_NAME}} API is running",
      service: "{{PROJECT_NAME}}",
      health: "/health"
    };
  }
}
