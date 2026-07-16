
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const movement = await this.internalMovementsService.findOne(id);
      if (!movement) {
        throw new HttpException('Movement not found', HttpStatus.NOT_FOUND);
      }
      return movement;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    try {
      return await this.internalMovementsService.update(id, updateDto);
    } catch (error) {
      console.error('Update InternalMovement Error:', error);
      throw new HttpException(
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
