import { Module } from '@nestjs/common';
import { WorkoutBuilderService } from './workout-builder.service';
import { ExerciseLibraryModule } from 'src/exercise-library/exercise-library.module';
import { ScoringModule } from './scoring/scoring.module';
import { AiModule } from 'src/ai/ai.module';
@Module({
  imports: [
    ExerciseLibraryModule,
    ScoringModule,
    AiModule,
  ],
  providers: [WorkoutBuilderService],
  exports: [WorkoutBuilderService],
})
export class WorkoutBuilderModule {}
