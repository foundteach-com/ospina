import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cash-flow')
@UseGuards(JwtAuthGuard)
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.cashFlowService.create(createDto);
  }

  @Get()
  findAll() {
    return this.cashFlowService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.cashFlowService.getSummary();
  }
}
