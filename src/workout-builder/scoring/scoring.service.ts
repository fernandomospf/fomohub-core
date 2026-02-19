import { Injectable } from '@nestjs/common';
import { ScoringContext } from './scoring.context.interface';
import { ExerciseCandidate } from 'src/exercise-library/exercise-candidate.interface';

@Injectable()
export class ScoringService {
  scoreExercise(
    exercise: ExerciseCandidate,
    context: ScoringContext,
  ): number {
    let score = 0;

    score += this.goalScore(exercise, context);
    score += this.phaseScore(exercise, context);
    score += this.compoundBonus(exercise);
    score += this.stimulusScore(exercise);

    score -= this.fatiguePenalty(exercise, context);
    score -= this.repetitionPenalty(exercise, context);
    score -= this.weeklyVolumePenalty(exercise, context);

    score += Math.random() * 0.5;

    return score;
  }

  private goalScore(
    exercise: ExerciseCandidate,
    context: ScoringContext,
  ): number {
    if (context.goal === 'hypertrophy') {
      return exercise.is_compound ? 2 : 1;
    }

    if (context.goal === 'strength') {
      if (exercise.is_compound) return 3;
      if (exercise.fatigue_score <= 3) return 2;
    }

    if (context.goal === 'endurance') {
      if (exercise.stimulus_type === 'metabolic') return 2;
      return 1;
    }

    return 0;
  }

  private phaseScore(
    exercise: ExerciseCandidate,
    context: ScoringContext,
  ): number {
    if (context.phaseType === 'peak') {
      return exercise.is_compound ? 3 : 0;
    }

    if (context.phaseType === 'deload') {
      return exercise.fatigue_score <= 2 ? 2 : -2;
    }

    return 1;
  }

  private compoundBonus(exercise: ExerciseCandidate): number {
    return exercise.is_compound ? 1 : 0;
  }

  private stimulusScore(exercise: ExerciseCandidate): number {
    if (exercise.stimulus_type === 'mechanical_tension') return 2;
    if (exercise.stimulus_type === 'metabolic') return 1;
    return 0;
  }

  private fatiguePenalty(
    exercise: ExerciseCandidate,
    context: ScoringContext,
  ): number {
    if (
      context.currentWorkoutFatigue + exercise.fatigue_score >
      context.fatigueLimit
    ) {
      return exercise.fatigue_score * 2;
    }

    return exercise.fatigue_score * 0.8;
  }

  private repetitionPenalty(
    exercise: ExerciseCandidate,
    context: ScoringContext,
  ): number {
    if (context.usedExercisesLastWeeks.includes(exercise.id)) {
      return 5;
    }

    return 0;
  }

  private weeklyVolumePenalty(
    exercise: ExerciseCandidate,
    context: ScoringContext,
  ): number {
    let penalty = 0;

    for (const contribution of exercise.muscle_contributions ?? []) {
      const current =
        context.currentWeeklyVolume?.[contribution.muscle] ?? 0;

      const target =
        context.targetWeeklyVolume?.[contribution.muscle] ?? 0;

      if (!target) continue;

      const ratio = current / target;

      if (ratio >= 1) {
        penalty += 6 * contribution.weight;
      } else if (ratio >= 0.8) {
        penalty += 3 * contribution.weight;
      }
    }

    return penalty;
  }
}
