import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-workout')
  async generateWorkout(@Body() dto: GenerateWorkoutDto) {
    const workout = await this.aiService.generateWorkout(dto);
    return workout;
  }
}
