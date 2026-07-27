import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('operations')
@UseGuards(JwtAuthGuard)
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  // ==========================================
  // DASHBOARD
  // ==========================================
  @Get('dashboard/indicators')
  getDashboardIndicators() {
    return this.operationsService.getDashboardIndicators();
  }

  // ==========================================
  // PROCESSES (PROCESOS)
  // ==========================================

  @Post('processes')
  createProcess(@Body() data: any) {
    return this.operationsService.createProcess({
      name: data.name,
      code: data.code,
      description: data.description,
      objective: data.objective,
      status: data.status,
      color: data.color,
      icon: data.icon,
      responsibleId: data.responsibleId,
    });
  }

  @Get('processes')
  findAllProcesses(
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.operationsService.findAllProcesses({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where: status ? { status } : undefined,
    });
  }

  @Get('processes/:id')
  findOneProcess(@Param('id') id: string) {
    return this.operationsService.findOneProcess(id);
  }

  @Patch('processes/:id')
  updateProcess(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.operationsService.updateProcess(id, {
      name: data.name,
      code: data.code,
      description: data.description,
      objective: data.objective,
      status: data.status,
      color: data.color,
      icon: data.icon,
      responsibleId: data.responsibleId,
    });
  }

  @Delete('processes/:id')
  removeProcess(@Param('id') id: string) {
    return this.operationsService.removeProcess(id);
  }

  // ==========================================
  // TASKS (TAREAS)
  // ==========================================

  @Post('tasks')
  createTask(@Body() data: any) {
    return this.operationsService.createTask({
      name: data.name,
      description: data.description,
      priority: data.priority,
      status: data.status,
      frequency: data.frequency,
      dayOfWeek: data.dayOfWeek ? parseInt(data.dayOfWeek) : undefined,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      time: data.time,
      responsibleId: data.responsibleId,
      observations: data.observations,
      relatedModule: data.relatedModule,
      relatedRecordId: data.relatedRecordId,
      process: { connect: { id: data.processId } },
    });
  }

  @Get('tasks')
  findAllTasks(
    @Query('processId') processId?: string,
    @Query('status') status?: string,
  ) {
    return this.operationsService.findAllTasks({ processId, status });
  }

  @Get('tasks/:id')
  findOneTask(@Param('id') id: string) {
    return this.operationsService.findOneTask(id);
  }

  @Patch('tasks/:id')
  updateTask(
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.operationsService.updateTask(id, {
      name: data.name,
      description: data.description,
      priority: data.priority,
      status: data.status,
      frequency: data.frequency,
      dayOfWeek: data.dayOfWeek ? parseInt(data.dayOfWeek) : undefined,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      time: data.time,
      responsibleId: data.responsibleId,
      observations: data.observations,
      relatedModule: data.relatedModule,
      relatedRecordId: data.relatedRecordId,
    });
  }

  @Patch('tasks/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() data: { status: string; observations?: string },
  ) {
    return this.operationsService.updateTask(id, { 
      status: data.status as any, 
      observations: data.observations 
    });
  }

  @Delete('tasks/:id')
  removeTask(@Param('id') id: string) {
    return this.operationsService.removeTask(id);
  }
}
