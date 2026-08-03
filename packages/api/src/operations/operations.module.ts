import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OperationsController, ProjectsController],
  providers: [OperationsService, ProjectsService],
  exports: [OperationsService, ProjectsService],
})
export class OperationsModule {}
