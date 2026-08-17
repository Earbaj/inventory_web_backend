import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TrashService } from './trash.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Recycle Bin & Data Recovery')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/trash')
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get()
  @ApiOperation({ summary: 'List all soft-deleted items, customers, sales, and returns in Recycle Bin' })
  getTrashItems(@GetUser() user: any) {
    return this.trashService.getTrashItems(user);
  }

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
