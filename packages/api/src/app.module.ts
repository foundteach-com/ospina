import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    ProductsModule, 
    OrdersModule, CashFlowModule, ProvidersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
