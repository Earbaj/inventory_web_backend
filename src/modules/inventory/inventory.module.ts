import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Item, ItemSchema } from './schemas/item.schema';
import { Category, CategorySchema } from './schemas/category.schema';

/**
 * Inventory Module
 * ইনভেন্টরি ও প্রোডাক্ট ক্যাটালগের জন্য প্রয়োজনীয় ডাটাবেজ মডেল, কন্ট্রোলার ও প্রোভাইডারসমূহ রেজিস্ট্রেশন মডিউল।
 */
@Module({
  imports: [
    // Item এবং Category কালেকশন স্কিমা MongoDB তে রেজিস্টার করা
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, MongooseModule],
})
export class InventoryModule {}
