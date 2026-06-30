import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { CompareCarsDto } from './dto/compare-cars.dto';
import { SearchCarsDto } from './dto/search-cars.dto';
import { Car } from './entities/car.entity';

const SEARCH_CACHE_TTL_MS = 60_000;
const FILTERS_CACHE_KEY = 'cars:filters';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) { }

  async search(dto: SearchCarsDto) {
    const cacheKey = `cars:search:${JSON.stringify(dto)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const qb = this.carRepository.createQueryBuilder('car');

    if (dto.query) {
      qb.andWhere(
        '(car.make ILIKE :query OR car.model ILIKE :query OR car.variant ILIKE :query)',
        { query: `%${dto.query}%` },
      );
    }
    if (dto.make) {
      qb.andWhere('car.make ILIKE :make', { make: dto.make });
    }
    if (dto.bodyType) {
      qb.andWhere('car.bodyType ILIKE :bodyType', { bodyType: dto.bodyType });
    }
    if (dto.fuelType) {
      qb.andWhere('car.fuelType ILIKE :fuelType', { fuelType: dto.fuelType });
    }
    if (dto.transmission) {
      qb.andWhere('car.transmission ILIKE :transmission', {
        transmission: dto.transmission,
      });
    }
    if (dto.seatingCapacity) {
      qb.andWhere('car.seatingCapacity = :seatingCapacity', {
        seatingCapacity: dto.seatingCapacity,
      });
    }
    if (dto.minPrice !== undefined) {
      qb.andWhere('car.priceInr >= :minPrice', { minPrice: dto.minPrice });
    }
    if (dto.maxPrice !== undefined) {
      qb.andWhere('car.priceInr <= :maxPrice', { maxPrice: dto.maxPrice });
    }

    qb.orderBy('car.make', 'ASC')
      .addOrderBy('car.model', 'ASC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [data, total] = await qb.getManyAndCount();
    const result = { data, total, page: dto.page, limit: dto.limit };

    await this.cache.set(cacheKey, result, SEARCH_CACHE_TTL_MS);
    return result;
  }

  async findOne(id: string) {
    const car = await this.carRepository.findOne({ where: { id } });
    if (!car) throw new NotFoundException(`Car ${id} not found`);
    return car;
  }

  async getFilters() {
    const cached = await this.cache.get(FILTERS_CACHE_KEY);
    if (cached) return cached;

    const [makes, bodyTypes, fuelTypes, transmissions] = await Promise.all([
      this.distinctValues('make'),
      this.distinctValues('bodyType'),
      this.distinctValues('fuelType'),
      this.distinctValues('transmission'),
    ]);

    const result = { makes, bodyTypes, fuelTypes, transmissions };
    await this.cache.set(FILTERS_CACHE_KEY, result, SEARCH_CACHE_TTL_MS);
    return result;
  }

  async compare(dto: CompareCarsDto) {
    if (dto.firstId === dto.secondId) {
      throw new BadRequestException('Cannot compare a car with itself');
    }

    const [first, second] = await Promise.all([
      this.findOne(dto.firstId),
      this.findOne(dto.secondId),
    ]);

    return { first, second };
  }

  private async distinctValues(column: keyof Car): Promise<string[]> {
    const rows: { value: string }[] = await this.carRepository
      .createQueryBuilder('car')
      .select(`DISTINCT car.${column}`, 'value')
      .where(`car.${column} IS NOT NULL`)
      .orderBy('value', 'ASC')
      .getRawMany();

    return rows.map((row) => row.value);
  }
}
