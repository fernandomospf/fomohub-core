import { Module } from '@nestjs/common';
import { ExerciseLibraryService } from './exercise-library.service';

@Module({
  providers: [ExerciseLibraryService],
  exports: [ExerciseLibraryService],
})

export class ExerciseLibraryModule {}
