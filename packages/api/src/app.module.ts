import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SalesModule } from './sales/sales.module';
import { InventoryModule } from './inventory/inventory.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { ProvidersModule } from './providers/providers.module';
import { ClientsModule } from './clients/clients.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StorageModule } from './storage/storage.module';
import { SettingsModule } from './settings/settings.module';
import { CotizacionesModule } from './cotizaciones/cotizaciones.module';
import { InternalMovementsModule } from './internal-movements/internal-movements.module';
import { ContactModule } from './contact/contact.module';
import { HrModule } from './hr/hr.module';
import { OperationsModule } from './operations/operations.module';
import { SstModule } from './sst/sst.module';
import { LegalModule } from './legal/legal.module';
import { ItModule } from './it/it.module';
import { ComercialModule } from './comercial/comercial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    ProductsModule,
    PurchasesModule,
    SalesModule,
    InventoryModule,
    CashFlowModule,
    ProvidersModule,
    ClientsModule,
    DashboardModule,
    StorageModule,
    SettingsModule,
    CotizacionesModule,
    InternalMovementsModule,
    ContactModule,
    HrModule,
    OperationsModule,
    SstModule,
    LegalModule,
    ItModule,
    ComercialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
