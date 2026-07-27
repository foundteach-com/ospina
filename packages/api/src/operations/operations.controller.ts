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
      
      // Campos de Recurrencia Avanzada
      recurrenceInterval: data.recurrenceInterval ? parseInt(data.recurrenceInterval) : 1,
      daysOfWeek: data.daysOfWeek || null,
      monthlyType: data.monthlyType || null,
      monthDay: data.monthDay ? parseInt(data.monthDay) : null,
      weekOfMonth: data.weekOfMonth ? parseInt(data.weekOfMonth) : null,
      recurrenceEndType: data.recurrenceEndType || 'NEVER',
      recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : null,
      recurrenceCount: data.recurrenceCount ? parseInt(data.recurrenceCount) : null,

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
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek ? parseInt(data.dayOfWeek) : null;
    if (data.scheduledDate !== undefined) updateData.scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.time !== undefined) updateData.time = data.time;
    if (data.observations !== undefined) updateData.observations = data.observations;
    if (data.processId) updateData.process = { connect: { id: data.processId } };

    // Campos de Recurrencia
    if (data.recurrenceInterval !== undefined) updateData.recurrenceInterval = data.recurrenceInterval ? parseInt(data.recurrenceInterval) : 1;
    if (data.daysOfWeek !== undefined) updateData.daysOfWeek = data.daysOfWeek;
    if (data.monthlyType !== undefined) updateData.monthlyType = data.monthlyType;
    if (data.monthDay !== undefined) updateData.monthDay = data.monthDay ? parseInt(data.monthDay) : null;
    if (data.weekOfMonth !== undefined) updateData.weekOfMonth = data.weekOfMonth ? parseInt(data.weekOfMonth) : null;
    if (data.recurrenceEndType !== undefined) updateData.recurrenceEndType = data.recurrenceEndType;
    if (data.recurrenceEndDate !== undefined) updateData.recurrenceEndDate = data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : null;
    if (data.recurrenceCount !== undefined) updateData.recurrenceCount = data.recurrenceCount ? parseInt(data.recurrenceCount) : null;

    return this.operationsService.updateTask(id, updateData);
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
