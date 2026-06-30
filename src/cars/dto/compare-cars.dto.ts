import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CompareCarsDto {
  @ApiProperty()
  @IsUUID()
  firstId: string;

  @ApiProperty()
  @IsUUID()
  secondId: string;
}
