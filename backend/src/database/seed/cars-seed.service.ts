import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'csv-parse/sync';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Car } from '../../cars/entities/car.entity';
import { ParsedCar, parseCarRow } from './car-row.parser';

const SEED_FILES = ['cars_ds_final.csv', 'cars_ds_final_2021.csv'];

@Injectable()
export class CarsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CarsSeedService.name);

  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async onApplicationBootstrap() {
    const existingCount = await this.carRepository.count();
    if (existingCount > 0) {
      this.logger.log(
        `Skipping car seed, ${existingCount} cars already present`,
      );
      return;
    }

    const seedDir = join(process.cwd(), 'seed', 'data');
    const merged = new Map<string, ParsedCar>();

    for (const fileName of SEED_FILES) {
      const filePath = join(seedDir, fileName);
      if (!existsSync(filePath)) {
        this.logger.warn(`Seed file not found: ${filePath}`);
        continue;
      }

      const content = readFileSync(filePath, 'utf-8');
      const rows: Record<string, string>[] = parse(content, {
        columns: true,
        skip_empty_lines: true,
      });

      for (const row of rows) {
        const parsed = parseCarRow(row);
        if (!parsed) continue;
        const key = `${parsed.make}|${parsed.model}|${parsed.variant}`;
        merged.set(key, parsed);
      }
    }

    if (merged.size === 0) {
      this.logger.warn('No seed data found, skipping car seed');
      return;
    }

    const cars = [...merged.values()];
    const batchSize = 200;
    for (let i = 0; i < cars.length; i += batchSize) {
      const batch = cars.slice(i, i + batchSize);
      await this.carRepository.insert(batch);
    }

    this.logger.log(`Seeded ${cars.length} cars`);
  }
}
