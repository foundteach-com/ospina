import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('operations')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ==========================================
  // PROJECTS
  // ==========================================

  @Post('projects')
  createProject(@Body() data: any) {
    return this.projectsService.createProject({
      name: data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status,
    });
  }

  @Get('projects')
  findAllProjects() {
    return this.projectsService.findAllProjects();
  }

  @Get('projects/:id')
  findOneProject(@Param('id') id: string) {
    return this.projectsService.findOneProject(id);
  }

  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.status !== undefined) updateData.status = data.status;
    return this.projectsService.updateProject(id, updateData);
  }

  @Delete('projects/:id')
  removeProject(@Param('id') id: string) {
    return this.projectsService.removeProject(id);
  }

  // ==========================================
  // PROJECT TASKS
  // ==========================================

  @Post('project-tasks')
  createTask(@Body() data: any) {
    return this.projectsService.createTask({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: data.status || 'TODO',
      assignedTo: data.assignedTo,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
    });
  }

  @Patch('project-tasks/:id')
  updateTask(@Param('id') id: string, @Body() data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    
    return this.projectsService.updateTask(id, updateData);
  }

  @Patch('project-tasks/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() data: { status: string },
  ) {
    return this.projectsService.updateTaskStatus(id, data.status);
  }

  @Delete('project-tasks/:id')
  removeTask(@Param('id') id: string) {
    return this.projectsService.removeTask(id);
  }

  // ==========================================
  // CHECKLISTS
  // ==========================================

  @Post('checklists')
  createChecklist(@Body() data: any) {
    return this.projectsService.createChecklist({
      title: data.title,
      description: data.description,
      task: data.taskId ? { connect: { id: data.taskId } } : undefined,
    });
  }

  @Patch('checklists/:id/toggle')
  toggleChecklist(@Param('id') id: string) {
    return this.projectsService.toggleChecklist(id);
  }

  @Delete('checklists/:id')
  removeChecklist(@Param('id') id: string) {
    return this.projectsService.removeChecklist(id);
  }
}
