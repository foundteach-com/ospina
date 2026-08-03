import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Project, Task, Checklist } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // PROJECTS (PROYECTOS)
  // ==========================================

  async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prisma.project.create({ data });
  }

  async findAllProjects(): Promise<Project[]> {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          include: {
            checklists: true,
          }
        }
      }
    });
  }

  async findOneProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            checklists: true,
          }
        }
      }
    });
    if (!project) {
      throw new NotFoundException(`Proyecto con ID "${id}" no encontrado`);
    }
    return project;
  }

  async updateProject(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    await this.findOneProject(id);
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async removeProject(id: string): Promise<Project> {
    await this.findOneProject(id);
    return this.prisma.project.delete({
      where: { id },
    });
  }

  // ==========================================
  // TASKS FOR PROJECTS (project-tasks)
  // ==========================================

  async createTask(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  async updateTask(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async removeTask(id: string): Promise<Task> {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async updateTaskStatus(id: string, status: string): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data: { status },
    });
  }

  // ==========================================
  // CHECKLISTS FOR PROJECT TASKS
  // ==========================================

  async createChecklist(data: Prisma.ChecklistCreateInput): Promise<Checklist> {
    return this.prisma.checklist.create({ data });
  }

  async toggleChecklist(id: string): Promise<Checklist> {
    const checklist = await this.prisma.checklist.findUnique({ where: { id } });
    if (!checklist) {
      throw new NotFoundException(`Checklist con ID "${id}" no encontrado`);
    }
    return this.prisma.checklist.update({
      where: { id },
      data: { isCompleted: !checklist.isCompleted },
    });
  }

  async removeChecklist(id: string): Promise<Checklist> {
    return this.prisma.checklist.delete({
      where: { id },
    });
  }
}
