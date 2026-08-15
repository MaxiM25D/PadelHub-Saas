import { Module } from "@nestjs/common";

import { MercadoPagoService } from "./mercado-pago.service.js";

@Module({ providers: [MercadoPagoService], exports: [MercadoPagoService] })
export class MercadoPagoModule {}
