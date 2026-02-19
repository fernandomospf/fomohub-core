import { Injectable } from '@nestjs/common';
import { ScoringService } from './scoring/scoring.service';
import { ScoringContext } from './scoring/scoring.context.interface';
import { ExerciseLibraryService } from 'src/exercise-library/exercise-library.service';
import { ExerciseCandidate } from 'src/exercise-library/exercise-candidate.interface';

@Injectable()
export class WorkoutBuilderService {
  constructor(
    private readonly exerciseLibrary: ExerciseLibraryService,
    private readonly scoringService: ScoringService,
  ) {}

  async buildWorkout(params: {
    slots: string[];
    level: string;
    equipment?: string[];
    context: ScoringContext & {
      weeklyFrequency: number;
      progressionProfile?: Record<
        string,
        { adaptation_state: 'progressing' | 'stagnant' | 'regressing' }
      >;
    };
  }) {

    const { slots, level, equipment } = params;

    const context = {
      ...params.context,
      currentWorkoutFatigue: 0,
      fatigueLimit: this.resolveFatigueLimit(params.context.phaseType),
    };

    const selected: ExerciseCandidate[] = [];
    const maxExercises = 8;
    const minExercises = 6;

    const template = this.getStructuralTemplate(slots);
    const muscleCounter: Record<
      string,
      { primary: number; secondary: number }
    > = {};

    for (const slot of slots) {

      const muscle = this.mapSlotToMuscle(slot);
      if (!muscle) continue;

      if (!muscleCounter[muscle]) {
        muscleCounter[muscle] = { primary: 0, secondary: 0 };
      }

      const candidates =
        await this.exerciseLibrary.findCandidates(
          slot,
          level,
          equipment,
        );

      if (!candidates?.length) continue;

      const scored = candidates
        .map(ex => ({
          exercise: ex,
          score: this.enhancedScore(ex, context, level),
        }))
        .sort((a, b) => b.score - a.score);

      for (const item of scored) {

        if (selected.length >= maxExercises) break;
        if (this.isRedundant(item.exercise, selected)) continue;

        const isPrimary =
          item.exercise.priority_type === 'primary';

        const target = template[muscle];
        if (!target) continue;

        if (
          isPrimary &&
          muscleCounter[muscle].primary >= target.primary
        ) continue;

        if (
          !isPrimary &&
          muscleCounter[muscle].secondary >= target.secondary
        ) continue;

        selected.push(item.exercise);
        context.currentWorkoutFatigue += item.exercise.fatigue_score;

        if (isPrimary)
          muscleCounter[muscle].primary++;
        else
          muscleCounter[muscle].secondary++;
      }
    }

    await this.ensureStructuralMinimum(
      selected,
      slots,
      level,
      equipment,
      context,
    );

    if (selected.length < minExercises) {

      let allCandidates: ExerciseCandidate[] = [];

      for (const slot of slots) {
        const candidates =
          await this.exerciseLibrary.findCandidates(
            slot,
            level,
            equipment,
          );

        allCandidates = [...allCandidates, ...candidates];
      }

      const fallback = allCandidates
        .filter(ex => !selected.some(s => s.id === ex.id))
        .sort((a, b) =>
          this.enhancedScore(b, context, level) -
          this.enhancedScore(a, context, level),
        );

      for (const ex of fallback) {

        if (selected.length >= minExercises) break;

        if (
          context.currentWorkoutFatigue +
          ex.fatigue_score >
          context.fatigueLimit * 1.2
        ) continue;

        selected.push(ex);
        context.currentWorkoutFatigue += ex.fatigue_score;
      }
    }

    return selected.slice(0, maxExercises);
  }

  private async ensureStructuralMinimum(
    selected: ExerciseCandidate[],
    slots: string[],
    level: string,
    equipment: string[] | undefined,
    context: any,
  ) {

    const requiredMuscles = ['biceps', 'triceps'];

    for (const muscle of requiredMuscles) {

      if (!slots.includes(muscle)) continue;

      const alreadyExists =
        selected.some(e =>
          this.mapSlotToMuscle(e.movement_pattern) === muscle
        );

      if (alreadyExists) continue;

      const candidates =
        await this.exerciseLibrary.findCandidates(
          muscle,
          level,
          equipment,
        );

      const best =
        candidates
          .filter(c => c.priority_type !== 'primary')
          .sort((a, b) =>
            this.enhancedScore(b, context, level) -
            this.enhancedScore(a, context, level)
          )[0];

      if (best) {
        selected.push(best);
        context.currentWorkoutFatigue += best.fatigue_score;
      }
    }
  }

  private getStructuralTemplate(
    slots: string[],
  ): Record<string, { primary: number; secondary: number }> {

    const template: Record<
      string,
      { primary: number; secondary: number }
    > = {};

    for (const slot of slots) {

      const muscle = this.mapSlotToMuscle(slot);
      if (!muscle) continue;

      if (!template[muscle]) {
        template[muscle] = { primary: 0, secondary: 0 };
      }

      template[muscle].primary +=
        muscle === 'chest' ||
        muscle === 'back' ||
        muscle === 'quads'
          ? 1
          : 0;

      template[muscle].secondary +=
        muscle === 'biceps' ||
        muscle === 'triceps'
          ? 1
          : 0;
    }

    return template;
  }

  private enhancedScore(
    exercise: ExerciseCandidate,
    context: any,
    level: string,
  ): number {

    let score =
      this.scoringService.scoreExercise(
        exercise,
        context,
      );

    if (context.usedExercisesLastWeeks?.includes(exercise.id))
      score -= 12;

    if (
      level !== 'iniciante' &&
      exercise.equipment === 'bodyweight'
    )
      score -= 6;

    return score;
  }

  private isRedundant(
    exercise: ExerciseCandidate,
    selected: ExerciseCandidate[],
  ) {
    return selected.some(e => e.id === exercise.id);
  }

  private resolveFatigueLimit(phase: string): number {
    if (phase === 'base') return 26;
    if (phase === 'intensification') return 22;
    if (phase === 'peak') return 18;
    if (phase === 'deload') return 14;
    return 20;
  }

  private mapSlotToMuscle(slot: string): string | null {
    const mapping: Record<string, string> = {
      horizontal_press: 'chest',
      vertical_press: 'shoulders',
      triceps: 'triceps',
      vertical_pull: 'back',
      horizontal_pull: 'back',
      biceps: 'biceps',
      squat: 'quads',
      hip_hinge: 'hamstrings',
      calves: 'calves',
      abs: 'abs',
    };

    return mapping[slot] ?? null;
  }
}
