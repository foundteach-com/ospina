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
        orderBy: orderBy || { name: 'asc' },
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
    responsibleId?: string;
  }): Promise<OpTask[]> {
    const where: Prisma.OpTaskWhereInput = { deletedAt: null };
    if (params?.processId) where.processId = params.processId;
    if (params?.status) where.status = params.status as any;
    if (params?.responsibleId) where.responsibleId = params.responsibleId;

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

      // Auto-generate next recurrence task if completing a recurring task
      if (data.status === 'COMPLETED' && task.frequency && task.frequency !== 'CUSTOM' as any) {
        await this.handleNextRecurrenceTask(task);
      }
    }

    return this.prisma.opTask.update({
      where: { id },
      data,
      include: {
        process: true,
      },
    });
  }

  private async handleNextRecurrenceTask(currentTask: OpTask) {
    // Check end condition
    const currentCount = (currentTask.currentOccurrence || 1);
    
    if (currentTask.recurrenceEndType === 'AFTER_COUNT' && currentTask.recurrenceCount) {
      if (currentCount >= currentTask.recurrenceCount) {
        return; // Finalizó por límite de ocurrencias
      }
    }

    const nextDate = this.calculateNextOccurrenceDate(currentTask);
    if (!nextDate) return;

    if (currentTask.recurrenceEndType === 'ON_DATE' && currentTask.recurrenceEndDate) {
      if (nextDate > currentTask.recurrenceEndDate) {
        return; // Finalizó por fecha límite
      }
    }

    // Clone and create next task
    await this.prisma.opTask.create({
      data: {
        name: currentTask.name,
        description: currentTask.description,
        processId: currentTask.processId,
        priority: currentTask.priority,
        status: 'PENDING',
        frequency: currentTask.frequency,
        recurrenceInterval: currentTask.recurrenceInterval,
        daysOfWeek: currentTask.daysOfWeek,
        monthlyType: currentTask.monthlyType,
        monthDay: currentTask.monthDay,
        weekOfMonth: currentTask.weekOfMonth,
        recurrenceEndType: currentTask.recurrenceEndType,
        recurrenceEndDate: currentTask.recurrenceEndDate,
        recurrenceCount: currentTask.recurrenceCount,
        currentOccurrence: currentCount + 1,
        scheduledDate: nextDate,
        dueDate: nextDate,
        isAllDay: currentTask.isAllDay,
        startTime: currentTask.startTime,
        endTime: currentTask.endTime,
        responsibleId: currentTask.responsibleId,
        observations: currentTask.observations,
      },
    });
  }

  private calculateNextOccurrenceDate(task: OpTask): Date | null {
    const baseDate = task.scheduledDate ? new Date(task.scheduledDate) : new Date();
    const interval = task.recurrenceInterval || 1;
    const freq = String(task.frequency);

    const next = new Date(baseDate);

    if (freq === 'DAILY') {
      for (let i = 0; i < interval; i++) {
        next.setDate(next.getDate() + 1);
        while (next.getDay() === 0 || next.getDay() === 6) {
          next.setDate(next.getDate() + 1);
        }
      }
      return next;
    }

    if (freq === 'WEEKLY') {
      // If daysOfWeek specified (e.g. "MON,WED,FRI")
      if (task.daysOfWeek) {
        const daysMap: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
        const targetDays = task.daysOfWeek.split(',').map(d => daysMap[d.trim()]).filter(d => d !== undefined).sort();
        
        if (targetDays.length > 0) {
          const currentDay = baseDate.getDay();
          // Find next day in the same week
          const nextDayInWeek = targetDays.find(d => d > currentDay);
          if (nextDayInWeek !== undefined) {
            next.setDate(next.getDate() + (nextDayInWeek - currentDay));
            return next;
          } else {
            // Jump to first target day in the next interval week
            const daysUntilNextWeek = (7 - currentDay) + targetDays[0] + (7 * (interval - 1));
            next.setDate(next.getDate() + daysUntilNextWeek);
            return next;
          }
        }
      }
      // Standard weekly interval
      next.setDate(next.getDate() + (7 * interval));
      return next;
    }

    if (freq === 'MONTHLY') {
      next.setMonth(next.getMonth() + interval);
      
      if (task.monthlyType === 'DAY_OF_MONTH' && task.monthDay) {
        if (task.monthDay === -1) {
          // Último día del mes
          next.setMonth(next.getMonth() + 1, 0);
        } else {
          const targetMonth = next.getMonth();
          next.setDate(task.monthDay);
          if (next.getMonth() !== targetMonth) {
            next.setDate(0); // Volver al último día del mes objetivo si se pasó
          }
        }
        return next;
      }
      
      if (task.monthlyType === 'DAY_OF_WEEK' && task.weekOfMonth && task.daysOfWeek) {
        const daysMap: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
        // Tomar el primer día (asumiendo que en este modo solo se selecciona uno)
        const targetDay = daysMap[task.daysOfWeek.split(',')[0].trim()];
        
        if (targetDay !== undefined) {
          next.setDate(1); // Ir al inicio del mes
          const targetMonth = next.getMonth();
          
          if (task.weekOfMonth === -1) {
            // Última ocurrencia del día en el mes
            next.setMonth(targetMonth + 1, 0);
            while (next.getDay() !== targetDay) {
              next.setDate(next.getDate() - 1);
            }
          } else {
            // 1ra, 2da, 3ra, 4ta ocurrencia
            while (next.getDay() !== targetDay) {
              next.setDate(next.getDate() + 1);
            }
            next.setDate(next.getDate() + (7 * (task.weekOfMonth - 1)));
            // Si nos pasamos de mes, volver una semana
            if (next.getMonth() !== targetMonth) {
              next.setDate(next.getDate() - 7);
            }
          }
        }
        return next;
      }

      return next;
    }

    if (freq === 'ANNUAL') {
      next.setFullYear(next.getFullYear() + interval);
      return next;
    }

    return null;
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
