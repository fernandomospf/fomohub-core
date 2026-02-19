import { Injectable } from '@nestjs/common';
import { ExerciseCandidate } from 'src/exercise-library/exercise-candidate.interface';
import { WorkoutBuilderService } from 'src/workout-builder/workout-builder.service';
import { ScoringContext } from 'src/workout-builder/scoring/scoring.context.interface';

@Injectable()
export class ProgramGeneratorService {
  constructor(
    private readonly workoutBuilder: WorkoutBuilderService,
  ) { }

  async generateWeek(params: {
    days: { slots: string[] }[];
    level: string;
    equipment?: string[];
    baseContext: Omit<ScoringContext, 'currentWorkoutFatigue' | 'currentWeeklyVolume'> & {
      weeklyFrequency: number;
      progressionProfile?: Record<
        string,
        {
          adaptation_state: 'progressing' | 'stagnant' | 'regressing';
        }
      >;
    };
    targetWeeklyVolume: Record<string, number>;
  }) {
    const {
      days,
      level,
      equipment,
      baseContext,
      targetWeeklyVolume,
    } = params;

    const currentWeeklyVolume =
      this.initializeVolume(targetWeeklyVolume);

    const weekPlan: ExerciseCandidate[][] = [];

    for (const day of days) {
      const fullContext = {
        ...baseContext,
        currentWorkoutFatigue: 0,
        currentWeeklyVolume,
        targetWeeklyVolume,
      };

      const workout =
        await this.workoutBuilder.buildWorkout({
          slots: day.slots,
          level,
          equipment,
          context: fullContext,
        });

      this.updateWeeklyVolume(
        workout,
        currentWeeklyVolume,
      );

      weekPlan.push(workout);
    }

    return {
      weekPlan,
      currentWeeklyVolume,
    };
  }

  private initializeVolume(
    target: Record<string, number>,
  ): Record<string, number> {
    const volume: Record<string, number> = {};

    for (const muscle of Object.keys(target)) {
      volume[muscle] = 0;
    }

    return volume;
  }

  private updateWeeklyVolume(
    exercises: ExerciseCandidate[],
    currentWeeklyVolume: Record<string, number>,
  ) {
    const DEFAULT_SETS = 3;

    for (const exercise of exercises) {
      for (const contribution of exercise.muscle_contributions ?? []) {
        const added =
          DEFAULT_SETS * contribution.weight;

        currentWeeklyVolume[contribution.muscle] =
          (currentWeeklyVolume[contribution.muscle] ?? 0) +
          added;
      }
    }
  }
}
