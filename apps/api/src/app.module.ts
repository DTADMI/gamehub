import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AccessControlModule } from "./modules/access-control/access-control.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { ProjectsModule } from "./modules/projects/projects.module";

@Module({
  imports: [PrismaModule, AuthModule, AccessControlModule, ProjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
