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
    goals: string[];
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
        params.goals,
        isOverreaching,
      );

      const reps = this.resolveReps(
        exercise,
        params.goals,
      );

      const load = this.resolveLoad(
        exercise,
        params.phase,
        params.goals,
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
          params.goals,
        ),
      });
    }

    return prescriptions;
  }

  private resolveSets(
    exercise: ExerciseCandidate,
    phase: string,
    goals: string[],
    overreach: boolean,
  ) {

    if (overreach) return 2;

    const primary =
      exercise.priority_type === 'primary';
      
    let totalSets = 0;

    for (const goal of goals) {
      if (goal === 'strength') totalSets += primary ? 5 : 3;
      else if (goal === 'hypertrophy') totalSets += primary ? 4 : 3;
      else if (goal === 'endurance') totalSets += 3;
      else if (goal === 'fat_loss') totalSets += 3;
      else totalSets += 3;
    }

    return Math.round(totalSets / goals.length);
  }

  private resolveReps(
    exercise: ExerciseCandidate,
    goals: string[],
  ) {

    const primary =
      exercise.priority_type === 'primary';
      
    let totalReps = 0;

    for (const goal of goals) {
      if (goal === 'strength') totalReps += primary ? 4 : 6;
      else if (goal === 'hypertrophy') totalReps += primary ? 8 : 12;
      else if (goal === 'endurance') totalReps += primary ? 15 : 18;
      else if (goal === 'fat_loss') totalReps += primary ? 12 : 15;
      else totalReps += 10;
    }

    return Math.round(totalReps / goals.length);
  }

  private resolveLoad(
    _exercise: ExerciseCandidate,
    phase: string,
    goals: string[],
    progressionData?: {
      suggested_next_1rm?: number;
    },
    overreach?: boolean,
  ) {

    const oneRM =
      progressionData?.suggested_next_1rm;

    if (!oneRM) return 0;

    let totalPercent = 0;

    for (const goal of goals) {
      let percent = 0.7;
      if (goal === 'strength') percent = 0.9;
      if (goal === 'hypertrophy') percent = 0.75;
      if (goal === 'endurance') percent = 0.6;
      if (goal === 'fat_loss') percent = 0.65;
      totalPercent += percent;
    }
    
    let avgPercent = totalPercent / goals.length;

    if (phase === 'deload') avgPercent -= 0.1;
    if (overreach) avgPercent -= 0.05;

    return Number((oneRM * avgPercent).toFixed(1));
  }

  private resolveRest(
    _phase: string,
    goals: string[],
  ) {
    let totalRest = 0;

    for (const goal of goals) {
      if (goal === 'strength') totalRest += 180;
      else if (goal === 'hypertrophy') totalRest += 90;
      else if (goal === 'endurance') totalRest += 45;
      else if (goal === 'fat_loss') totalRest += 30;
      else totalRest += 90;
    }

    return Math.round(totalRest / goals.length);
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
