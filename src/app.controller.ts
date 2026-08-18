import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Health Check & System Status Controller
 * সিস্টেমের হেলথ স্ট্যাটাস, ডাটাবেজ কানেকশন, আপটাইম এবং সার্ভার মেট্রিক্স চেক করার এন্ডপয়েন্ট।
 */
@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('api/health')
  @ApiOperation({ summary: 'Health check system status and database connection state' })
  @ApiResponse({ status: 200, description: 'Server health metrics' })
  getHealth() {
    const isDbConnected = this.connection.readyState === 1;
    return {
      status: isDbConnected ? 'ok' : 'degraded',
      service: 'Keeper POS Backend Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: isDbConnected ? 'connected' : 'disconnected',
        readyState: this.connection.readyState,
      },
    };
  }
}
