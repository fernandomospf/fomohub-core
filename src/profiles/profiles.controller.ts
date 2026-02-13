import { Body, Controller, Get, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/auth.guard';
import { ProfilesService } from './profiles.service';
import { OnboardingDto } from 'src/dto/onboarding.dto';
import * as express from 'express';
import { UpdateMeasurementsDto } from 'src/dto/updateMeasurements.dto';

@Controller('profiles')
@UseGuards(SupabaseAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) { }

  @Get('me')
  getMe(@Req() req) {
    return this.profilesService.findMe(req);
  }

  @Post('onboarding')
  async onboarding(@Req() req, @Body() dto: OnboardingDto, @Res() res: express.Response) {
    const response = await this.profilesService.completeOnboarding(req, dto);
    if (!response.success) return res.status(HttpStatus.BAD_REQUEST).json({
      error: "Error completing onboarding"
    });
    return res.status(HttpStatus.CREATED).json({
      success: "Onboarding completed successfully"
    });
  }

  @Get('profile/info')
  async profileData(@Req() req) {
    return this.profilesService.profileData(req);
  }

  @Patch('update/measurements')
  async updateMeasurements(
    @Req() req,
    @Body() dto: UpdateMeasurementsDto,
  ) {
    await this.profilesService.addMeasurement(req, dto);

    return {
      success: true,
      message: 'Medidas atualizadas com sucesso',
    };
  }

  @Get('offensive-days')
  async offensiveDays(@Req() req, @Res() res) {
    try {
      const offensiveDays = await this.profilesService.offensiveDays(req);
      return res.status(HttpStatus.OK).json({
        offensiveDays
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Error getting offensive days"
      });
    }
  }
}
