import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Corrida Noturna SP - 10km', description: 'New event title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated event description', description: 'New description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Trail Run', description: 'New category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'https://cdn.fomohub.com/events/new.jpg', description: 'New image URL' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({ example: '2026-12-31T21:00:00.000Z', description: 'New event date and time (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  event_date?: string;

  @ApiPropertyOptional({ example: 'Parque Villa-Lobos, São Paulo - SP', description: 'New location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 150, description: 'New max participants' })
  @IsOptional()
  @IsNumber()
  max_participants?: number;

  @ApiPropertyOptional({ example: false, description: 'Whether the event is free' })
  @IsOptional()
  @IsBoolean()
  is_free?: boolean;

  @ApiPropertyOptional({ example: 50.00, description: 'New price in BRL' })
  @IsOptional()
  @IsNumber()
  price?: number;
}
