import { Controller, Get } from "@nestjs/common";
import type { ApiHealth } from "@padelhub/shared";

@Controller("health")
export class HealthController {
  @Get()
  health(): ApiHealth {
    return { status: "ok", service: "padelhub-api", timestamp: new Date().toISOString() };
  }
}
