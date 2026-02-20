import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { ProfilesService } from './profiles.service';
import { OnboardingDto } from 'src/dto/onboarding.dto';
import * as express from 'express';
import { UpdateMeasurementsDto } from 'src/dto/updateMeasurements.dto';

@ApiTags('Profiles')
@ApiBearerAuth('access-token')
@Controller('profiles')
@UseGuards(SupabaseAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the full profile data of the currently authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.' })
  getMe(@Req() req) {
    return this.profilesService.findMe(req);
  }

  @Post('onboarding')
  @ApiOperation({
    summary: 'Complete user onboarding',
    description: 'Submits fitness data, PAR-Q answers, and consent info to complete the onboarding flow. Can only be called once.',
  })
  @ApiResponse({ status: 201, description: 'Onboarding completed successfully.' })
  @ApiResponse({ status: 400, description: 'Onboarding data is invalid or already completed.' })
  async onboarding(
    @Req() req,
    @Body() dto: OnboardingDto,
    @Res() res: express.Response,
  ) {
    const response = await this.profilesService.completeOnboarding(req, dto);
    if (!response.success)
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Error completing onboarding' });
    return res.status(HttpStatus.CREATED).json({ success: 'Onboarding completed successfully' });
  }

  @Get('profile/info')
  @ApiOperation({
    summary: 'Get detailed profile info',
    description: 'Returns extended fitness profile data including goals, measurements, and experience level.',
  })
  @ApiResponse({ status: 200, description: 'Profile info retrieved successfully.' })
  async profileData(@Req() req) {
    return this.profilesService.profileData(req);
  }

  @Patch('update/measurements')
  @ApiOperation({
    summary: 'Update body measurements',
    description: 'Creates a new body measurement entry for the authenticated user. All fields are optional — only provided fields are saved.',
  })
  @ApiResponse({ status: 200, description: 'Measurements updated successfully.' })
  async updateMeasurements(@Req() req, @Body() dto: UpdateMeasurementsDto) {
    await this.profilesService.addMeasurement(req, dto);
    return { success: true, message: 'Measurements updated successfully' };
  }

  @Get('offensive-days')
  @ApiOperation({
    summary: 'Get training streak (offensive days)',
    description: 'Returns the number of consecutive days the user has completed at least one workout session.',
  })
  @ApiResponse({ status: 200, description: 'Streak returned successfully.' })
  async offensiveDays(@Req() req, @Res() res) {
    try {
      const offensiveDays = await this.profilesService.offensiveDays(req);
      return res.status(HttpStatus.OK).json({ offensiveDays });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error getting streak days' });
    }
  }

  @Get('training-count')
  @ApiOperation({
    summary: 'Get total training session count',
    description: 'Returns the total number of completed workout sessions for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Training count returned successfully.' })
  async trainingCount(@Req() req, @Res() res) {
    try {
      const trainingCount = await this.profilesService.countTraining(req);
      return res.status(HttpStatus.OK).json({ trainingCount });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error getting training count' });
    }
  }

  @Get('last-training')
  @ApiOperation({
    summary: 'Get last training session',
    description: 'Returns information about the most recent completed workout session of the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Last training session returned successfully.' })
  async lastTraining(@Req() req, @Res() res) {
    try {
      const lastTraining = await this.profilesService.lastTraining(req);
      return res.status(HttpStatus.OK).json({ lastTraining });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error getting last training' });
    }
  }
}
