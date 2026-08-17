import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateItemDto, UpdateItemDto, UpdateStockDto, CreateCategoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Inventory & Products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  @ApiOperation({ summary: 'Create new product item' })
  createItem(@Body() createItemDto: CreateItemDto, @GetUser() user: any) {
    return this.inventoryService.createItem(createItemDto, user);
  }

  @Get('items')
  @ApiOperation({ summary: 'List all inventory product items' })
  @ApiQuery({ name: 'category', required: false })
  findAllItems(@GetUser() user: any, @Query('category') category?: string) {
    return this.inventoryService.findAllItems(user, category);
  }

  @Get('items/low-stock')
  @ApiOperation({ summary: 'Get items with low stock warning (stockQuantity <= lowStockThreshold)' })
  findLowStockItems(@GetUser() user: any) {
    return this.inventoryService.findLowStockItems(user);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get product item by ID' })
  findOneItem(@Param('id') id: string, @GetUser() user: any) {
    return this.inventoryService.findOneItem(id, user);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update item details' })
  updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @GetUser() user: any,
  ) {
    return this.inventoryService.updateItem(id, updateItemDto, user);
  }

  @Patch('items/:id/stock')
  @ApiOperation({ summary: 'Adjust item stock quantity (+/-)' })
  updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
    @GetUser() user: any,
  ) {
    return this.inventoryService.updateStock(id, updateStockDto, user);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete product item (Moves to Recycle Bin/Trash)' })
  removeItem(@Param('id') id: string, @GetUser() user: any) {
    return this.inventoryService.removeItem(id, user);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all product categories' })
  findAllCategories(@GetUser() user: any) {
    return this.inventoryService.findAllCategories(user);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: any) {
    return this.inventoryService.createCategory(createCategoryDto, user);
  }
}
