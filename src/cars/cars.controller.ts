import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CompareCarsDto } from './dto/compare-cars.dto';
import { SearchCarsDto } from './dto/search-cars.dto';

@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search cars with text query and filters' })
  search(@Query() dto: SearchCarsDto) {
    return this.carsService.search(dto);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Distinct filter options for the search UI' })
  getFilters() {
    return this.carsService.getFilters();
  }

  @Get('compare')
  @ApiOperation({ summary: 'Compare two cars side by side' })
  @ApiOkResponse({ description: 'Full specs for both cars' })
  compare(@Query() dto: CompareCarsDto) {
    return this.carsService.compare(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single car by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.carsService.findOne(id);
  }
}
