import { Module } from '@nestjs/common';
import { AdaptiveWorkoutEngine } from './adaptive-workout.engine';

@Module({
  providers: [AdaptiveWorkoutEngine],
  exports: [AdaptiveWorkoutEngine],
})
export class TrainingEngineModule {}
