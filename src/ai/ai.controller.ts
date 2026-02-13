import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';
import { SupabaseAuthGuard } from '../auth/auth.guard';

@Controller('ai')
@UseGuards(SupabaseAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Post('generate-workout')
  @HttpCode(HttpStatus.CREATED)
  async generateWorkout(@Req() req, @Body() dto: GenerateWorkoutDto, @Res() res) {
    try {
      const response = await this.aiService.generateWorkout(req, dto);
      return res.status(HttpStatus.CREATED).json({
        id: response.id
      })
    } catch (error) {
      return res.status(error.status).json({ error: error.message })
    }
  }

  @Get('remaining-credit')
  @HttpCode(HttpStatus.OK)
  async remainingCredit(@Req() req, @Res() res) {
    const credits = await this.aiService.remainingUserCredit(req);
    return res.status(HttpStatus.OK).json({ credits });
  }
}
