import { Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TrashService } from './trash.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Recycle Bin & Data Recovery Controller
 * ভুলবশত ডিলিট হওয়া ডাটা দেখা, একই টেবিলে রিস্টোর (Restore) করা এবং স্থায়ীভাবে মুছে ফেলার (Hard Delete) এইচটিটিপি এন্ডপয়েন্ট।
 */
@ApiTags('Recycle Bin & Data Recovery')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/trash')
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  /**
   * 1. Get Trash Items List Endpoint
   * শপের সকল সফট-ডিলিট হওয়া ডাটার (আইটেম, কাস্টমার, সেলস, রিটার্ন) পেজিনেটেড তালিকা দেখা।
   */
  @Get()
  @ApiOperation({ summary: 'List all soft-deleted items, customers, sales, and returns in Recycle Bin (Paginated)' })
  @ApiQuery({ name: 'entityType', required: false, enum: ['all', 'item', 'customer', 'sale', 'return'] })
  getTrashItems(@GetUser() user: any, @Query() query: PaginationQueryDto & { entityType?: string }) {
    return this.trashService.getTrashItems(user, query);
  }

  /**
   * 2. Restore Soft-Deleted Item Endpoint
   * ডিলিট হওয়া ডাটাকে আগের সক্রিয় টেবিলে রিস্টোর (Restore) করে ফিরিয়ে আনা।
   */
  @Post('restore/:entityType/:id')
  @ApiOperation({ summary: 'Restore a deleted record back to active shop database list' })
  @ApiParam({ name: 'entityType', enum: ['item', 'customer', 'sale', 'return'] })
  restoreItem(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    return this.trashService.restoreItem(entityType, id, user);
  }

  /**
   * 3. Permanent Hard-Delete Item Endpoint (Shop Admin Only)
   * ডাটাবেজ স্টোরেজ থেকে ডাটাকে স্থায়ীভাবে মুছে ফেলা (Permanent Hard Delete)।
   */
  @Delete('permanent/:entityType/:id')
  @ApiOperation({ summary: 'Permanently hard-delete a record from MongoDB storage (Shop Admin only)' })
  @ApiParam({ name: 'entityType', enum: ['item', 'customer', 'sale', 'return'] })
  permanentDelete(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    return this.trashService.permanentDelete(entityType, id, user);
  }
}
