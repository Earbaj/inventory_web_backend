import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateItemDto, UpdateItemDto, UpdateStockDto, CreateCategoryDto, QueryItemDto } from './dto/inventory.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

/**
 * Inventory Controller
 * পণ্য ও ইনভেন্টরি ক্যাটালগ ম্যানেজমেন্টের সকল এইচটিটিপি এপিআই এন্ডপয়েন্ট।
 */
@ApiTags('Inventory & Products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * 1. Create Product Item Endpoint
   * ইনভেন্টরিতে নতুন পণ্য যোগ করা (ফ্রি টিয়ারে সর্বোচ্চ ৫টি পণ্য যোগ করা যাবে)।
   */
  @Post('items')
  @ApiOperation({ summary: 'Create new product item (Max 5 for Free Tier)' })
  createItem(@Body() createItemDto: CreateItemDto, @GetUser() user: any) {
    return this.inventoryService.createItem(createItemDto, user);
  }

  /**
   * 2. List All Inventory Product Items Endpoint
   * শপের সকল একটিভ পণ্যের পেজিনেটেড তালিকা দেখা (ঐচ্ছিক ক্যাটাগরি ও সার্চ ফিল্টারসহ)।
   */
  @Get('items')
  @ApiOperation({ summary: 'List all inventory product items (Paginated)' })
  findAllItems(@GetUser() user: any, @Query() query: QueryItemDto) {
    return this.inventoryService.findAllItems(user, query);
  }

  /**
   * 3. Get Low Stock Warning Items Endpoint
   * যেসব পণ্যের মজুদ নির্দিষ্ট থ্রেশহোল্ডের নিচে নেমে গেছে সেগুলোর পেজিনেটেড তালিকা।
   */
  @Get('items/low-stock')
  @ApiOperation({ summary: 'Get items with low stock warning (stockQuantity <= lowStockThreshold) (Paginated)' })
  findLowStockItems(@GetUser() user: any, @Query() query: PaginationQueryDto) {
    return this.inventoryService.findLowStockItems(user, query);
  }

  /**
   * 4. Get Single Item Details Endpoint
   */
  @Get('items/:id')
  @ApiOperation({ summary: 'Get product item by ID' })
  findOneItem(@Param('id') id: string, @GetUser() user: any) {
    return this.inventoryService.findOneItem(id, user);
  }

  /**
   * 5. Update Product Details Endpoint
   */
  @Put('items/:id')
  @ApiOperation({ summary: 'Update item details' })
  updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @GetUser() user: any,
  ) {
    return this.inventoryService.updateItem(id, updateItemDto, user);
  }

  /**
   * 6. Adjust Stock Quantity (+/- N) Endpoint
   * স্টকের পরিমাণ ম্যানুয়ালি বাড়াতে বা কমাতে ব্যবহার করুন।
   */
  @Patch('items/:id/stock')
  @ApiOperation({ summary: 'Adjust item stock quantity (+/-)' })
  updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
    @GetUser() user: any,
  ) {
    return this.inventoryService.updateStock(id, updateStockDto, user);
  }

  /**
   * 7. Soft-Delete Product Item Endpoint
   * পণ্য ডিলিট করা (ডাটা ডাটাবেজ থেকে মুছে না গিয়ে রিসাইকেল বিনে স্থানান্তর হবে)।
   */
  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete product item (Moves to Recycle Bin/Trash)' })
  removeItem(@Param('id') id: string, @GetUser() user: any) {
    return this.inventoryService.removeItem(id, user);
  }

  /**
   * 8. List All Categories Endpoint
   */
  @Get('categories')
  @ApiOperation({ summary: 'List all product categories (Paginated)' })
  findAllCategories(@GetUser() user: any, @Query() query: PaginationQueryDto) {
    return this.inventoryService.findAllCategories(user, query);
  }

  /**
   * 9. Create Product Category Endpoint
   */
  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: any) {
    return this.inventoryService.createCategory(createCategoryDto, user);
  }
}
