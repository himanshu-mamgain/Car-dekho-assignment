import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../../cars/entities/car.entity';
import { CarsSeedService } from './cars-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car])],
  providers: [CarsSeedService],
})
export class SeedModule {}
