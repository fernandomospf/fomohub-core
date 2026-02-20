import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProgramOrchestratorService } from './program-orchestrator.service';
import { SupabaseAuthGuard } from 'src/auth/auth.guard';

@ApiTags('Training Programs')
@ApiBearerAuth('access-token')
@Controller('training-programs')
@UseGuards(SupabaseAuthGuard)
export class ProgramController {
  constructor(private readonly orchestrator: ProgramOrchestratorService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate training program',
    description: 'Generates a personalized multi-week training program based on the user\'s goals, experience level, weekly frequency, and session duration. The program is persisted and linked to the authenticated user.',
  })
  @ApiResponse({ status: 201, description: 'Training program generated and saved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid parameters for program generation.' })
  async generate(@Req() req, @Body() body) {
    const userId = req.user.id;
    return this.orchestrator.generateProgram({ ...body, userId });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get training program by ID',
    description: 'Returns a training program by its UUID, including all phases, weeks, days, and exercises. Access is restricted to the owner.',
  })
  @ApiParam({ name: 'id', description: 'Training program UUID', example: 'f3a1b2c4-1234-5678-abcd-ef0123456789' })
  @ApiResponse({ status: 200, description: 'Training program retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Access denied — not the owner of this program.' })
  @ApiResponse({ status: 404, description: 'Training program not found.' })
  async getProgram(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.orchestrator.getProgram(id, userId);
  }
}
