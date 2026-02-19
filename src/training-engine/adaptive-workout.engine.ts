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
    progressionProfile?: Record<
      string,
      {
        last_1rm?: number;
        prev_1rm?: number;
        suggested_next_1rm?: number;
      }
    >;
  }) {

    const prescriptions:ExercisePrescription[] = [];

    const isOverreaching =
      this.detectOverreaching(params.progressionProfile);

    for (const exercise of params.exercises) {

      const sets = this.resolveSets(
        exercise,
        params.phase,
        isOverreaching,
      );

      const reps = this.resolveReps(
        exercise,
        params.phase,
      );

      const load = this.resolveLoad(
        exercise,
        params.phase,
        reps,
        params.progressionProfile?.[exercise.id],
        isOverreaching,
      );

      prescriptions.push({
        exerciseId: exercise.id,
        name: exercise.name,
        sets,
        reps,
        suggestedLoad: load,
        restSeconds: this.resolveRest(params.phase),
      });
    }

    return prescriptions;
  }

  private resolveSets(
    exercise: ExerciseCandidate,
    phase: string,
    overreach: boolean,
  ) {

    if (overreach) return 2;

    if (phase === 'base') {
      return exercise.priority_type === 'primary' ? 4 : 3;
    }

    if (phase === 'intensification') return 3;

    if (phase === 'peak') return 2;

    if (phase === 'deload') return 2;

    return 3;
  }

  private resolveReps(
    exercise: ExerciseCandidate,
    phase: string,
  ) {

    const primary = exercise.priority_type === 'primary';

    if (phase === 'base')
      return primary ? 10 : 12;

    if (phase === 'intensification')
      return primary ? 6 : 8;

    if (phase === 'peak')
      return primary ? 4 : 6;

    if (phase === 'deload')
      return primary ? 8 : 10;

    return 10;
  }


  private resolveLoad(
    exercise: ExerciseCandidate,
    phase: string,
    reps: number,
    progressionData?: {
      suggested_next_1rm?: number;
    },
    overreach?: boolean,
  ) {

    const oneRM =
      progressionData?.suggested_next_1rm;

    if (!oneRM) return 0;

    let percent = 0.7;

    if (phase === 'base') percent = 0.7;
    if (phase === 'intensification') percent = 0.8;
    if (phase === 'peak') percent = 0.9;
    if (phase === 'deload') percent = 0.6;

    if (overreach) percent -= 0.05;

    return Number((oneRM * percent).toFixed(1));
  }


  private resolveRest(phase: string) {
    if (phase === 'peak') return 150;
    if (phase === 'intensification') return 120;
    if (phase === 'base') return 90;
    if (phase === 'deload') return 60;
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
