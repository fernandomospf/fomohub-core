import { Module } from '@nestjs/common';
import { ProgramGeneratorService } from './program-generator.service';
import { ProgramOrchestratorService } from './program-orchestrator.service';
import { WorkoutBuilderModule } from 'src/workout-builder/workout-builder.module';
import { ProgressionEngineModule } from 'src/progression-engine/progression-engine.module';
import { ProgramController } from './program-generator.controller';
import { TrainingEngineModule } from 'src/training-engine/training-engine.module';

@Module({
  imports: [
    WorkoutBuilderModule,
    ProgressionEngineModule,
    TrainingEngineModule
  ],
  controllers: [ProgramController],
  providers: [
    ProgramGeneratorService,
    ProgramOrchestratorService,
  ],
  exports: [ProgramGeneratorService],
})
export class ProgramGeneratorModule {}
