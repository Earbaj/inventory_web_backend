import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { TrashModule } from './modules/trash/trash.module';
import { SeedModule } from './modules/seed/seed.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ExportModule } from './modules/export/export.module';
import { AiPredictionsModule } from './modules/ai-predictions/ai-predictions.module';
import { ExpensesModule } from './modules/expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute window
      limit: Number(process.env.THROTTLE_LIMIT) || 20, // Max 20 requests per minute
    }]),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/keeper_pos',
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public'),
      exclude: ['/api/(.*)'],
    }),
    AuthModule,
    CustomersModule,
    InventoryModule,
    SalesModule,
    PaymentsModule,
    ReturnsModule,
    DashboardModule,
    SubscriptionsModule,
    TrashModule,
    SeedModule,
    AuditLogsModule,
    ExportModule,
    AiPredictionsModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

