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
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { WorkoutPlansService } from './workout-plans.service';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { AddSetToSessionDto } from './dto/addSetToSession.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { WorkoutPlansResponse } from './dto/listMyWorkouts.dto';
import { ActiveWorkoutSessionResponse } from './dto/active-workout-session.dto';

@ApiTags('Workout Plans')
@ApiBearerAuth('access-token')
@Controller('workout-plans')
@UseGuards(SupabaseAuthGuard)
export class WorkoutPlansController {
  constructor(private readonly service: WorkoutPlansService) {}

  @Get('liked')
  @ApiOperation({
    summary: 'List liked workout plans',
    description: 'Returns a paginated list of workout plans the authenticated user has liked.',
  })
  @ApiResponse({ status: 200, description: 'Liked plans retrieved successfully.' })
  async listMyLikedPlans(@Req() req, @Res() res, @Query() pagination: PaginationDto) {
    try {
      const response = await this.service.listMyLikedPlans(req, pagination);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Get('favorite')
  @ApiOperation({
    summary: 'List favorite workout plans',
    description: 'Returns a paginated list of workout plans saved as favorites by the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Favorite plans retrieved successfully.' })
  async listMyFavoritePlans(
    @Req() req,
    @Res() res,
    @Query() pagination: PaginationDto,
  ): Promise<WorkoutPlansResponse> {
    try {
      const response = await this.service.listMyFavoritePlans(req, pagination);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create workout plan',
    description: 'Creates a new workout plan owned by the authenticated user.',
  })
  @ApiResponse({ status: 201, description: 'Workout plan created successfully.' })
  createPlan(@Req() req, @Body() dto) {
    return this.service.createPlan(req, dto);
  }

  @Get('public')
  @ApiOperation({
    summary: 'List public workout plans',
    description: 'Returns all publicly available workout plans from any user, enriched with calorie estimates and like/favorite status.',
  })
  @ApiResponse({ status: 200, description: 'Public plans retrieved successfully.' })
  listPublic(@Req() req) {
    return this.service.listPublicPlans(req);
  }

  @Post(':id/like')
  @ApiOperation({
    summary: 'Toggle like on a workout plan',
    description: 'Likes a workout plan if not yet liked; removes the like if already liked (toggle behavior).',
  })
  @ApiParam({ name: 'id', description: 'Workout plan UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Like toggled.', schema: { example: { liked: true } } })
  toggleLike(@Req() req, @Param('id') planId: string) {
    return this.service.toggleLike(req, planId);
  }

  @Post(':id/favorite')
  @ApiOperation({
    summary: 'Toggle favorite on a workout plan',
    description: 'Saves a workout plan to favorites if not yet saved; removes from favorites if already saved (toggle behavior).',
  })
  @ApiParam({ name: 'id', description: 'Workout plan UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Favorite toggled.', schema: { example: { favorite: true } } })
  toggleFavorite(@Req() req, @Param('id') planId: string) {
    return this.service.toggleFavorite(req, planId);
  }

  @Get('sessions/active')
  @ApiOperation({
    summary: 'Get active workout session',
    description: 'Returns the current in-progress workout session for the authenticated user, including exercise details and completed sets. Returns 204 if there is no active session.',
  })
  @ApiResponse({ status: 200, description: 'Active session returned successfully.' })
  @ApiResponse({ status: 204, description: 'No active session found.' })
  async getActiveSession(
    @Req() req,
    @Res() res,
  ): Promise<void> {
    try {
      const result = await this.service.getActiveSession(req);
      if (!result) {
        return res.status(HttpStatus.NO_CONTENT).json({});
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      throw new HttpException(
        { message: error?.message ?? 'Error retrieving active session' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get workout plan by ID',
    description: 'Returns a single workout plan with its exercises, estimated calories, and public metadata.',
  })
  @ApiParam({ name: 'id', description: 'Workout plan UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Workout plan retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Workout plan not found.' })
  getWorkoutById(@Req() req, @Param('id') planId: string) {
    return this.service.getWorkoutById(req, { planId });
  }

  @Get()
  @ApiOperation({
    summary: 'List my workout plans',
    description: 'Returns a paginated list of workout plans owned by the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Workout plans retrieved successfully.' })
  async listMyPlans(
    @Req() req,
    @Res() res,
    @Query() pagination: PaginationDto,
  ): Promise<WorkoutPlansResponse> {
    try {
      const response = await this.service.listMyPlans(req, pagination);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @Post('workout-sessions/start')
  @ApiOperation({
    summary: 'Start workout session',
    description: 'Starts a new workout session for the given plan. Returns an error if there is already an active session in progress.',
  })
  @ApiResponse({ status: 201, description: 'Session started successfully.' })
  @ApiResponse({ status: 409, description: 'Another session is already in progress.' })
  startWorkoutSession(@Req() req, @Body() dto) {
    return this.service.startWorkoutSession(req, dto);
  }

  @Patch('workout-sessions/:id/finish')
  @ApiOperation({
    summary: 'Finish workout session',
    description: 'Marks an active session as finished by setting the finished_at timestamp.',
  })
  @ApiParam({ name: 'id', description: 'Workout session UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiResponse({ status: 200, description: 'Session finished successfully.' })
  finishWorkoutSession(@Req() req, @Param('id') sessionId: string) {
    return this.service.finishWorkoutSession(req, sessionId);
  }

  @Post('workout-sessions/:id/exercises')
  @ApiOperation({
    summary: 'Add exercise to session',
    description: 'Registers an exercise as part of the given session. Used to track which exercises were performed.',
  })
  @ApiParam({ name: 'id', description: 'Workout session UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiResponse({ status: 201, description: 'Exercise added to session.' })
  addExerciseToSession(@Req() req, @Param('id') sessionId: string, @Body() dto) {
    return this.service.addExerciseToSession(req, sessionId, dto);
  }

  @Post('workout-sessions/:id/sets')
  @ApiOperation({
    summary: 'Add set to session exercise',
    description: 'Records a completed set for an exercise within an active session. Also increments the completed_sets counter on workout_session_exercises.',
  })
  @ApiParam({ name: 'id', description: 'Workout session UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @ApiResponse({ status: 200, description: 'Set recorded successfully.' })
  addSetToSession(
    @Req() req,
    @Param('id') sessionId: string,
    @Body() dto: AddSetToSessionDto,
  ) {
    return this.service.addSetToSession(req, sessionId, dto);
  }

  @Get(':id/active')
  @ApiOperation({
    summary: 'Get active session for a specific plan',
    description: 'Returns the active session state (sessionId and completed sets per exercise) for a given workout plan, if there is one in progress.',
  })
  @ApiParam({ name: 'id', description: 'Workout plan UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Active workout state returned.' })
  getActiveWorkout(@Req() req, @Param('id') planId: string) {
    return this.service.getActiveWorkout(req, planId);
  }

  @Get('workout-history')
  @ApiOperation({
    summary: 'Get workout history',
    description: 'Returns the full training history of the authenticated user, grouped by exercise and date.',
  })
  @ApiResponse({ status: 200, description: 'Workout history retrieved successfully.' })
  getWorkoutHistory(@Req() req) {
    return this.service.getWorkoutHistory(req);
  }

  @Get('exercises/:exerciseId/history')
  @ApiOperation({
    summary: 'Get exercise history',
    description: 'Returns the performance history for a specific exercise, including sets, reps, and weight per session date.',
  })
  @ApiParam({ name: 'exerciseId', description: 'Workout exercise UUID', example: 'c3d4e5f6-a7b8-9012-cdef-012345678901' })
  @ApiResponse({ status: 200, description: 'Exercise history retrieved successfully.' })
  getExerciseHistory(@Req() req, @Param('exerciseId') exerciseId: string) {
    return this.service.getExerciseHistory(req, exerciseId);
  }

  @Get('tags/goals')
  @ApiOperation({
    summary: 'List available goal tags',
    description: 'Returns a deduplicated list of all goal tags used across public workout plans.',
  })
  @ApiResponse({ status: 200, description: 'Goal tags retrieved.', schema: { example: ['Hipertrofia', 'Emagrecimento'] } })
  getGoalsTags(@Req() req) {
    return this.service.getGoalsTags(req);
  }

  @Get('tags/muscle-groups')
  @ApiOperation({
    summary: 'List available muscle group tags',
    description: 'Returns a deduplicated list of all muscle group tags used across public workout plans.',
  })
  @ApiResponse({ status: 200, description: 'Muscle group tags retrieved.', schema: { example: ['Pernas', 'Costas', 'Peito'] } })
  getMuscleGroupsTags(@Req() req) {
    return this.service.getMuscleGroupsTags(req);
  }

  @Patch(':id/public')
  @ApiOperation({
    summary: 'Make workout plan public',
    description: 'Sets a workout plan as publicly visible. The plan will appear in the public listing after this action.',
  })
  @ApiParam({ name: 'id', description: 'Workout plan UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Plan is now public.' })
  turnPublic(@Req() req, @Param('id') planId: string) {
    return this.service.turnPublic(req, req.user.id, planId);
  }

  @Patch(':id/private')
  @ApiOperation({
    summary: 'Make workout plan private',
    description: 'Sets a workout plan as private. It will no longer appear in the public listing.',
  })
  @ApiParam({ name: 'id', description: 'Workout plan UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 200, description: 'Plan is now private.' })
  turnPrivate(@Req() req, @Param('id') planId: string) {
    return this.service.turnPrivate(req, req.user.id, planId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete workout plan',
    description: 'Permanently deletes a workout plan owned by the authenticated user. This action is irreversible.',
  })
  @ApiParam({ name: 'id', description: 'Workout plan UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({ status: 204, description: 'Plan deleted successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async deletePlan(@Req() req, @Res() res, @Param('id') planId: string) {
    try {
      await this.service.deletePlan(req, req.user.id, planId);
      return res.status(204).json({});
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
