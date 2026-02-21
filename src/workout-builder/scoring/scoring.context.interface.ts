export interface ScoringContext {
  goals: string[];
  phaseType: 'base' | 'intensification' | 'peak' | 'deload';
  weekNumber: number;

  weeklyFrequency: number;

  usedExercisesLastWeeks: string[];

  currentWorkoutFatigue: number;
  fatigueLimit: number;

  currentWeeklyVolume: Record<string, number>;
  targetWeeklyVolume: Record<string, number>;

  progressionProfile?: Record<
    string,
    {
      adaptation_state: 'progressing' | 'stagnant' | 'regressing';
    }
  >;
}
