import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  Body,
  Patch,
  Query,
  Res,
  Delete,
} from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { AddSetToSessionDto } from './dto/addSetToSession.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { WorkoutPlansResponse } from './dto/listMyWorkouts.dto';

@Controller('workout-plans')
@UseGuards(SupabaseAuthGuard)
export class WorkoutPlansController {
  constructor(private readonly service: WorkoutPlansService) { }

  @Get('liked')
  async listMyLikedPlans(
    @Req() req,
    @Res() res,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const response = await this.service.listMyLikedPlans(req, pagination);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Get('favorite')
  async listMyFavoritePlans(
    @Req() req,
    @Res() res,
    @Query() pagination: PaginationDto
  ): Promise<WorkoutPlansResponse> {
    try {
      const response = await this.service.listMyFavoritePlans(req, pagination);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
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
  async listMyPlans(
    @Req() req,
    @Res() res,
    @Query() pagination: PaginationDto
  ): Promise<WorkoutPlansResponse> {
    try {
      const response = await this.service.listMyPlans(req, pagination);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
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

  @Get('tags/goals')
  getGoalsTags(@Req() req) {
    return this.service.getGoalsTags(req);
  }

  @Get('tags/muscle-groups')
  getMuscleGroupsTags(@Req() req) {
    return this.service.getMuscleGroupsTags(req);
  }

  @Patch(':id/public')
  turnPublic(@Req() req, @Param('id') planId: string) {
    return this.service.turnPublic(req, req.user.id, planId);
  }

  @Patch(':id/private')
  turnPrivate(@Req() req, @Param('id') planId: string) {
    return this.service.turnPrivate(req, req.user.id, planId);
  }

  @Delete(':id')
  async deletePlan(
    @Req() req,
    @Res() res,
    @Param('id') planId: string) {
    try {
      await this.service.deletePlan(req, req.user.id, planId);
      return res.status(204).json({});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
