import { Injectable } from '@nestjs/common';
import { ExerciseCandidate } from 'src/exercise-library/exercise-candidate.interface';

export interface ExercisePrescription {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  suggestedLoad: number;
  restSeconds: number;
}

@Injectable()
export class AdaptiveWorkoutEngine {

  buildPrescription(params: {
    exercises: ExerciseCandidate[];
    phase: string;
    goal: 'hypertrophy' | 'strength' | 'endurance' | 'fat_loss';
    progressionProfile?: Record<
      string,
      {
        last_1rm?: number;
        prev_1rm?: number;
        suggested_next_1rm?: number;
      }
    >;
  }) {

    const prescriptions: ExercisePrescription[] = [];

    const isOverreaching =
      this.detectOverreaching(params.progressionProfile);

    for (const exercise of params.exercises) {

      const sets = this.resolveSets(
        exercise,
        params.phase,
        params.goal,
        isOverreaching,
      );

      const reps = this.resolveReps(
        exercise,
        params.goal,
      );

      const load = this.resolveLoad(
        exercise,
        params.phase,
        params.goal,
        params.progressionProfile?.[exercise.id],
        isOverreaching,
      );

      prescriptions.push({
        exerciseId: exercise.id,
        name: exercise.name,
        sets,
        reps,
        suggestedLoad: load,
        restSeconds: this.resolveRest(
          params.phase,
          params.goal,
        ),
      });
    }

    return prescriptions;
  }

  private resolveSets(
    exercise: ExerciseCandidate,
    phase: string,
    goal: string,
    overreach: boolean,
  ) {

    if (overreach) return 2;

    const primary =
      exercise.priority_type === 'primary';

    if (goal === 'strength')
      return primary ? 5 : 3;

    if (goal === 'hypertrophy')
      return primary ? 4 : 3;

    if (goal === 'endurance')
      return 3;

    if (goal === 'fat_loss')
      return 3;

    return 3;
  }

  private resolveReps(
    exercise: ExerciseCandidate,
    goal: string,
  ) {

    const primary =
      exercise.priority_type === 'primary';

    if (goal === 'strength')
      return primary ? 4 : 6;

    if (goal === 'hypertrophy')
      return primary ? 8 : 12;

    if (goal === 'endurance')
      return primary ? 15 : 18;

    if (goal === 'fat_loss')
      return primary ? 12 : 15;

    return 10;
  }

  private resolveLoad(
    _exercise: ExerciseCandidate,
    phase: string,
    goal: string,
    progressionData?: {
      suggested_next_1rm?: number;
    },
    overreach?: boolean,
  ) {

    const oneRM =
      progressionData?.suggested_next_1rm;

    if (!oneRM) return 0;

    let percent = 0.7;

    if (goal === 'strength') percent = 0.9;
    if (goal === 'hypertrophy') percent = 0.75;
    if (goal === 'endurance') percent = 0.6;
    if (goal === 'fat_loss') percent = 0.65;

    if (phase === 'deload') percent -= 0.1;

    if (overreach) percent -= 0.05;

    return Number((oneRM * percent).toFixed(1));
  }

  private resolveRest(
    _phase: string,
    goal: string,
  ) {

    if (goal === 'strength') return 180;
    if (goal === 'hypertrophy') return 90;
    if (goal === 'endurance') return 45;
    if (goal === 'fat_loss') return 30;

    return 90;
  }

  private detectOverreaching(
    profile?: Record<
      string,
      {
        last_1rm?: number;
        prev_1rm?: number;
      }
    >,
  ) {

    if (!profile) return false;

    let regressions = 0;

    for (const key of Object.keys(profile)) {
      const data = profile[key];

      if (
        data.last_1rm &&
        data.prev_1rm &&
        data.last_1rm < data.prev_1rm
      ) {
        regressions++;
      }
    }

    return regressions >= 2;
  }
}
