import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createDatabaseClient } from "@padelhub/database";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly client = createDatabaseClient();

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
