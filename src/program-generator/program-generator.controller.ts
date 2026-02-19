import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProgramOrchestratorService } from './program-orchestrator.service';
import { SupabaseAuthGuard } from 'src/auth/auth.guard';

@Controller('training-programs')
@UseGuards(SupabaseAuthGuard)
export class ProgramController {
  constructor(
    private readonly orchestrator: ProgramOrchestratorService,
  ) {}

  @Post('generate')
  async generate(@Req() req, @Body() body) {
    const userId = req.user.id;

    return this.orchestrator.generateProgram({
      ...body,
      userId,
    });
  }

  @Get(':id')
  async getProgram(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;

    return this.orchestrator.getProgram(id, userId);
  }
}
