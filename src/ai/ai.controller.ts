import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@Controller('ai')
@UseGuards(SupabaseAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-workout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate AI workout',
    description: 'Uses AI to generate a personalized workout plan based on user goals and fitness data. Consumes one AI credit per call.',
  })
  @ApiResponse({ status: 201, description: 'Workout generated successfully. Returns the generated workout plan ID.' })
  @ApiResponse({ status: 402, description: 'Insufficient AI credits.' })
  async generateWorkout(@Req() req, @Body() dto: GenerateWorkoutDto, @Res() res) {
    try {
      const response = await this.aiService.generateWorkout(req, dto);
      return res.status(HttpStatus.CREATED).json({ id: response.id });
    } catch (error) {
      return res.status(error.status).json({ error: error.message });
    }
  }

  @Get('remaining-credit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get remaining AI credits',
    description: 'Returns the number of AI workout generation credits still available for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Credits retrieved successfully.', schema: { example: { credits: 3 } } })
  async remainingCredit(@Req() req, @Res() res) {
    const credits = await this.aiService.remainingUserCredit(req);
    return res.status(HttpStatus.OK).json({ credits });
  }
}
