
import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { InternalMovementsService } from './internal-movements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('internal-movements')
@UseGuards(JwtAuthGuard)
export class InternalMovementsController {
  constructor(private readonly internalMovementsService: InternalMovementsService) {}

  @Post()
  async create(@Body() createDto: any) {
    try {
      return await this.internalMovementsService.create(createDto);
    } catch (error) {
      console.error('Create InternalMovement Error:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    return await this.internalMovementsService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.internalMovementsService.remove(id);
    } catch (error) {
       console.error('Delete InternalMovement Error:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
