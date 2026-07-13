import { ProductRepository } from '../repositories/product.repo';
import { CategoryRepository } from '../repositories/category.repo';
import { BrandRepository } from '../repositories/brand.repo';
import { ModelRepository } from '../repositories/model.repo';
import { Product, Brand, Category, PhoneModel } from '@/lib/db';

export class ProductService {
  static async getProducts(filters?: any): Promise<Product[]> {
    return ProductRepository.getProducts(filters);
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    return ProductRepository.getProductBySlug(slug);
  }

  static async getBrands(): Promise<Brand[]> {
    return BrandRepository.getBrands();
  }

  static async getCategories(): Promise<Category[]> {
    return CategoryRepository.getCategories();
  }

  static async getPhoneModels(brandId?: string): Promise<PhoneModel[]> {
    return ModelRepository.getPhoneModels(brandId);
  }

  static async getPhoneModelBySlug(slug: string): Promise<PhoneModel | null> {
    return ModelRepository.getPhoneModelBySlug(slug);
  }

  static async getRelatedProducts(categoryId: string, currentProductId: string): Promise<Product[]> {
    const products = await ProductRepository.getProducts({ categoryId });
    return products.filter(p => p.id !== currentProductId).slice(0, 4);
  }
}
