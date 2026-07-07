import { Module } from '@nestjs/common';
import { ComercialController } from './comercial.controller';
import { ComercialService } from './comercial.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComercialController],
  providers: [ComercialService],
})
export class ComercialModule {}
