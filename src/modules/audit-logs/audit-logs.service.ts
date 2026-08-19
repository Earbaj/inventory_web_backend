import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

/**
 * Audit Logs Service
 * শপের সিকিউরিটি অ্যাক্টিভিটি ট্র্যাক রাখা এবং অডিট ইতিহাস কুয়েরি করার সার্ভিস।
 */
@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  /**
   * Helper: Create Audit Log Entry
   */
  async logAction(params: {
    shopId: string;
    user: any;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, any>;
  }) {
    try {
      const log = new this.auditLogModel({
        shopId: params.shopId,
        userId: params.user.uid || params.user.id || 'system',
        userName: params.user.name || params.user.email || 'User',
        userRole: params.user.role || 'user',
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: params.details || {},
        date: new Date(),
      });
      await log.save();
    } catch (err) {
      // Non-blocking log failure
      console.error('[AuditLogsService] Failed to record audit log:', err);
    }
  }

  /**
   * List Audit Logs (Paginated & Filtered)
   */
  async findAll(user: any, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (user.role !== 'superadmin') {
      filter.shopId = user.shopId;
    }

    if (query.action) filter.action = query.action;
    if (query.entityType) filter.entityType = query.entityType;

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (query.search) {
      filter.$or = [
        { userName: { $regex: query.search, $options: 'i' } },
        { action: { $regex: query.search, $options: 'i' } },
        { entityType: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sortBy || 'date';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const total = await this.auditLogModel.countDocuments(filter);
    const logs = await this.auditLogModel
      .find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: logs.map(l => ({
        id: l._id.toString(),
        shopId: l.shopId,
        userId: l.userId,
        userName: l.userName,
        userRole: l.userRole,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        details: l.details,
        date: l.date,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
