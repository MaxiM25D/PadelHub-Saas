import { Module } from "@nestjs/common";

import { DatabaseModule } from "./database/database.module.js";
import { HealthModule } from "./health/health.module.js";
import { MercadoPagoModule } from "./integrations/mercado-pago/mercado-pago.module.js";

@Module({ imports: [DatabaseModule, HealthModule, MercadoPagoModule] })
export class AppModule {}
