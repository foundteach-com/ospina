import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
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
  findAll(@Query() query: any) {
    return this.cashFlowService.findAll(query);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.cashFlowService.update(id, updateDto);
    } catch (error) {
      console.error('Update CashFlow Error:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.cashFlowService.remove(id);
    } catch (error) {
      console.error('Delete CashFlow Error:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('summary')
  getSummary() {
    return this.cashFlowService.getSummary();
  }
}
