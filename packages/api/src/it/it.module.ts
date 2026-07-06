import { Module } from '@nestjs/common';
import { ItController } from './it.controller';
import { ItService } from './it.service';

@Module({
  controllers: [ItController],
  providers: [ItService]
})
export class ItModule {}
