import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Prisma } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: Prisma.ProductCreateInput) {
    console.log('[ProductsController] Creating product:', { name: data.name, code: data.code });
    return this.productsService.create(data);
  }

  @Get()
  findAll(@Query() query: any) {
    const whereClause: any = {};

    // Filter by category if provided
    if (query.category) {
      whereClause.categoryId = query.category;
    }

    // If showAll=true is not passed (public store request), only show published products
    if (query.showAll !== 'true') {
      whereClause.isPublished = true;
    }

    return this.productsService.findAll({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    });
  }

  @Get('categories')
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.ProductUpdateInput) {
    return this.productsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
