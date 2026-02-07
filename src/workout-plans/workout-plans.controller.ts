import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  Body,
  Patch,
} from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { AuthenticateRequest } from 'reqGuard';
import { AddSetToSessionDto } from './dto/addSetToSession.dto';

@Controller('workout-plans')
@UseGuards(SupabaseAuthGuard)
export class WorkoutPlansController {
  constructor(private readonly service: WorkoutPlansService) { }

  @Get('liked')
  listMyLikedPlans(@Req() req) {
    return this.service.listMyLikedPlans(req);
  }

  @Get('favorite')
  listMyFavoritePlans(@Req() req) {
    return this.service.listMyFavoritePlans(req);
  }

  @Post()
  createPlan(@Req() req, @Body() dto) {
    return this.service.createPlan(req, dto);
  }

  @Get('public')
  listPublic(@Req() req) {
    return this.service.listPublicPlans(req);
  }

  @Post(':id/like')
  toggleLike(
    @Req() req,
    @Param('id') planId: string,
  ) {
    return this.service.toggleLike(req, planId);
  }

  @Post(':id/favorite')
  toggleFavorite(
    @Req() req,
    @Param('id') planId: string,
  ) {
    return this.service.toggleFavorite(req, planId);
  }

  @Get(':id')
  getWorkoutById(
    @Req() req,
    @Param('id') planId: string,
  ) {
    return this.service.getWorkoutById(req, { planId });
  }

  @Get()
  listMyPlans(@Req() req) {
    return this.service.listMyPlans(req);
  }

  @Post('workout-sessions/start')
  startWorkoutSession(@Req() req, @Body() dto) {
    return this.service.startWorkoutSession(req, dto);
  }

  @Patch('workout-sessions/:id/finish')
  finishWorkoutSession(@Req() req, @Param('id') sessionId: string) {
    return this.service.finishWorkoutSession(req, sessionId);
  }

  @Post('workout-sessions/:id/exercises')
  addExerciseToSession(@Req() req, @Param('id') sessionId: string, @Body() dto) {
    return this.service.addExerciseToSession(req, sessionId, dto);
  }

  @Post('workout-sessions/:id/sets')
  addSetToSession(
    @Req() req,
    @Param('id') sessionId: string,
    @Body() dto: AddSetToSessionDto,
  ) {
    return this.service.addSetToSession(req, sessionId, dto);
  }

  @Get(':id/active')
  getActiveWorkout(
    @Req() req,
    @Param('id') planId: string,
  ) {
    return this.service.getActiveWorkout(req, planId);
  }

  @Get('workout-history')
  getWorkoutHistory(@Req() req) {
    return this.service.getWorkoutHistory(req);
  }

  @Get('exercises/:exerciseId/history')
  getExerciseHistory(
    @Req() req,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.service.getExerciseHistory(req, exerciseId);
  }

}
