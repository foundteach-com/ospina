import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  OpProcess,
  OpTask,
  OpProcedure,
  OpChecklist,
} from '@prisma/client';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // PROCESSES (PROCESOS)
  // ==========================================

  async createProcess(data: Prisma.OpProcessCreateInput): Promise<OpProcess> {
    return this.prisma.opProcess.create({ data });
  }

  async findAllProcesses(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.OpProcessWhereInput;
    orderBy?: Prisma.OpProcessOrderByWithRelationInput;
  }): Promise<{ processes: OpProcess[]; total: number }> {
    const { skip, take, where, orderBy } = params || {};
    const [processes, total] = await Promise.all([
      this.prisma.opProcess.findMany({
        skip,
        take,
        where: { ...where, deletedAt: null },
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          tasks: {
            where: { deletedAt: null },
            select: { id: true, status: true },
          },
        },
      }),
      this.prisma.opProcess.count({ where: { ...where, deletedAt: null } }),
    ]);
    return { processes, total };
  }

  async findOneProcess(id: string) {
    const process = await this.prisma.opProcess.findFirst({
      where: { id, deletedAt: null },
      include: {
        tasks: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
        procedures: {
          where: { deletedAt: null },
          include: {
            checklists: {
              include: { items: true },
            },
          },
        },
      },
    });
    if (!process) {
      throw new NotFoundException(`Proceso con ID "${id}" no encontrado`);
    }
    return process;
  }

  async updateProcess(
    id: string,
    data: Prisma.OpProcessUpdateInput,
  ): Promise<OpProcess> {
    await this.findOneProcess(id); // Validate exists
    return this.prisma.opProcess.update({
      where: { id },
      data,
    });
  }

  async removeProcess(id: string): Promise<OpProcess> {
    await this.findOneProcess(id);
    // Soft delete
    return this.prisma.opProcess.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ==========================================
  // TASKS (TAREAS)
  // ==========================================

  async createTask(data: Prisma.OpTaskCreateInput): Promise<OpTask> {
    return this.prisma.opTask.create({
      data,
      include: {
        process: true,
      },
    });
  }

  async findAllTasks(params?: {
    processId?: string;
    status?: string;
  }): Promise<OpTask[]> {
    const where: Prisma.OpTaskWhereInput = { deletedAt: null };
    if (params?.processId) where.processId = params.processId;
    if (params?.status) where.status = params.status as any;

    return this.prisma.opTask.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      include: {
        process: true,
      },
    });
  }

  async findOneTask(id: string) {
    const task = await this.prisma.opTask.findFirst({
      where: { id, deletedAt: null },
      include: {
        process: true,
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!task) {
      throw new NotFoundException(`Tarea con ID "${id}" no encontrada`);
    }
    return task;
  }

  async updateTask(id: string, data: Prisma.OpTaskUpdateInput): Promise<OpTask> {
    const task = await this.findOneTask(id);

    // If status changed, record history
    if (data.status && data.status !== task.status) {
      await this.prisma.opTaskHistory.create({
        data: {
          taskId: id,
          oldStatus: task.status,
          newStatus: data.status as any,
          observations: data.observations ? String(data.observations) : 'Cambio de estado',
        },
      });
    }

    return this.prisma.opTask.update({
      where: { id },
      data,
      include: {
        process: true,
      },
    });
  }

  async removeTask(id: string): Promise<OpTask> {
    await this.findOneTask(id);
    return this.prisma.opTask.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' },
    });
  }

  // ==========================================
  // DASHBOARD INDICATORS
  // ==========================================
  async getDashboardIndicators() {
    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      activeProcesses
    ] = await Promise.all([
      this.prisma.opTask.count({ where: { deletedAt: null } }),
      this.prisma.opTask.count({ where: { deletedAt: null, status: 'PENDING' } }),
      this.prisma.opTask.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
      this.prisma.opProcess.count({ where: { deletedAt: null, status: 'ACTIVE' } })
    ]);

    // Additional logic for 'overdue' tasks, 'completed today', etc. can be added here
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedToday = await this.prisma.opTaskHistory.count({
      where: {
        newStatus: 'COMPLETED',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const overdueTasks = await this.prisma.opTask.count({
      where: {
        deletedAt: null,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        dueDate: { lt: new Date() },
      },
    });

    return {
      totalTasks,
      pendingTasks,
      completedTasks,
      completedToday,
      activeProcesses,
      overdueTasks,
    };
  }
}
