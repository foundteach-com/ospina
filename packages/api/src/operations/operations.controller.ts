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
  // PROYECTOS
  // ==========================================

  @Post('projects')
  createProject(@Body() data: { name: string; description?: string; startDate?: string; endDate?: string; status?: string }) {
    return this.operationsService.createProject({
      name: data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status,
    });
  }

  @Get('projects')
  findAllProjects(
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.operationsService.findAllProjects({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      where: status ? { status } : undefined,
    });
  }

  @Get('projects/:id')
  findOneProject(@Param('id') id: string) {
    return this.operationsService.findOneProject(id);
  }

  @Patch('projects/:id')
  updateProject(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; startDate?: string; endDate?: string; status?: string },
  ) {
    return this.operationsService.updateProject(id, {
      name: data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status,
    });
  }

  @Delete('projects/:id')
  removeProject(@Param('id') id: string) {
    return this.operationsService.removeProject(id);
  }

  // ==========================================
  // TAREAS
  // ==========================================

  @Post('tasks')
  createTask(@Body() data: { title: string; description?: string; dueDate?: string; status?: string; assignedTo?: string; projectId?: string }) {
    return this.operationsService.createTask(data);
  }

  @Get('tasks')
  findAllTasks(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.operationsService.findAllTasks({ projectId, status });
  }

  @Get('tasks/:id')
  findOneTask(@Param('id') id: string) {
    return this.operationsService.findOneTask(id);
  }

  @Patch('tasks/:id')
  updateTask(
    @Param('id') id: string,
    @Body() data: { title?: string; description?: string; dueDate?: string; status?: string; assignedTo?: string },
  ) {
    return this.operationsService.updateTask(id, {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: data.status,
      assignedTo: data.assignedTo,
    });
  }

  @Patch('tasks/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() data: { status: string },
  ) {
    return this.operationsService.updateTaskStatus(id, data.status);
  }

  @Delete('tasks/:id')
  removeTask(@Param('id') id: string) {
    return this.operationsService.removeTask(id);
  }

  // ==========================================
  // CHECKLISTS
  // ==========================================

  @Post('checklists')
  createChecklist(@Body() data: { title: string; description?: string; taskId?: string }) {
    return this.operationsService.createChecklist(data);
  }

  @Patch('checklists/:id/toggle')
  toggleChecklist(@Param('id') id: string) {
    return this.operationsService.toggleChecklist(id);
  }

  @Delete('checklists/:id')
  removeChecklist(@Param('id') id: string) {
    return this.operationsService.removeChecklist(id);
  }
}
