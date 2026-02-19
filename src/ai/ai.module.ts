import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { WorkoutPlansModule } from '../workout-plans/workout-plans.module';

@Module({
  imports: [WorkoutPlansModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule { }
