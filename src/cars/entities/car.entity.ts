import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('cars')
@Unique('UQ_car_make_model_variant', ['make', 'model', 'variant'])
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  make: string;

  @Index()
  @Column()
  model: string;

  @Column()
  variant: string;

  @Index()
  @Column({ type: 'bigint', nullable: true })
  priceInr: number | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  fuelType: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  bodyType: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  transmission: string | null;

  @Column({ type: 'int', nullable: true })
  seatingCapacity: number | null;

  @Column({ type: 'int', nullable: true })
  doors: number | null;

  @Column({ type: 'int', nullable: true })
  displacementCc: number | null;

  @Column({ type: 'float', nullable: true })
  cityMileageKmpl: number | null;

  @Column({ type: 'float', nullable: true })
  highwayMileageKmpl: number | null;

  @Column({ type: 'varchar', nullable: true })
  powerRaw: string | null;

  @Column({ type: 'varchar', nullable: true })
  torqueRaw: string | null;

  @Column({ type: 'varchar', nullable: true })
  drivetrain: string | null;

  @Column({ type: 'jsonb' })
  specs: Record<string, string>;
}
