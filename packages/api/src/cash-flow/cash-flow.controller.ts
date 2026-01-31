import { Controller, Get, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cash-flow')
@UseGuards(JwtAuthGuard)
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Post()
  async create(@Body() createDto: any) {
    try {
      return await this.cashFlowService.create(createDto);
    } catch (error) {
      console.error('Create CashFlow Error:', error);
      throw new HttpException(error instanceof Error ? error.message : 'Unknown error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
