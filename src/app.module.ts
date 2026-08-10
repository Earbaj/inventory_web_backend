import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
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
    SeedModule,
  ],
})
export class AppModule {}
