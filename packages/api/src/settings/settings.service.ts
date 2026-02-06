import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Ensure initial settings exist
    await this.ensureSettings();
  }

  async ensureSettings() {
    const settings = await this.prisma.companySettings.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      await this.prisma.companySettings.create({
        data: {
          id: 'singleton',
          companyName: 'Ospina Admin',
        },
      });
    }
  }

  async getSettings() {
    return this.prisma.companySettings.findUnique({
      where: { id: 'singleton' },
    });
  }

  async updateSettings(data: any) {
    return this.prisma.companySettings.update({
      where: { id: 'singleton' },
      data,
    });
  }
}
