import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Project, Task, Checklist } from '@prisma/client';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // PROYECTOS
  // ==========================================

  async createProject(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prisma.project.create({ data });
  }

  async findAllProjects(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }): Promise<{ projects: Project[]; total: number }> {
    const { skip, take, where, orderBy } = params || {};
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          tasks: {
            select: { id: true, status: true },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);
    return { projects, total };
  }

  async findOneProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: {
            checklists: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
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
    return this.prisma.project.delete({ where: { id } });
  }

  // ==========================================
  // TAREAS
  // ==========================================

  async createTask(data: {
    title: string;
    description?: string;
    dueDate?: string;
    status?: string;
    assignedTo?: string;
    projectId?: string;
  }): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status || 'TODO',
        assignedTo: data.assignedTo,
        project: data.projectId
          ? { connect: { id: data.projectId } }
          : undefined,
      },
      include: {
        checklists: true,
      },
    });
  }

  async findAllTasks(params?: {
    projectId?: string;
    status?: string;
  }): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};
    if (params?.projectId) where.projectId = params.projectId;
    if (params?.status) where.status = params.status;

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        checklists: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findOneTask(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        checklists: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!task) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada`);
    }
    return task;
  }

  async updateTask(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    await this.findOneTask(id);
    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        checklists: true,
      },
    });
  }

  async updateTaskStatus(id: string, status: string): Promise<Task> {
    await this.findOneTask(id);
    return this.prisma.task.update({
      where: { id },
      data: { status },
      include: {
        checklists: true,
      },
    });
  }

  async removeTask(id: string): Promise<Task> {
    await this.findOneTask(id);
    return this.prisma.task.delete({ where: { id } });
  }

  // ==========================================
  // CHECKLISTS
  // ==========================================

  async createChecklist(data: {
    title: string;
    description?: string;
    taskId?: string;
  }): Promise<Checklist> {
    return this.prisma.checklist.create({
      data: {
        title: data.title,
        description: data.description,
        task: data.taskId ? { connect: { id: data.taskId } } : undefined,
      },
    });
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
    return this.prisma.checklist.delete({ where: { id } });
  }
}
