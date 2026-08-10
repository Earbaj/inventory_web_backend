import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});
