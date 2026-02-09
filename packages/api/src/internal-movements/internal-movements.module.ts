
import { Module } from '@nestjs/common';
import { InternalMovementsService } from './internal-movements.service';
import { InternalMovementsController } from './internal-movements.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InternalMovementsController],
  providers: [InternalMovementsService],
})
export class InternalMovementsModule {}
