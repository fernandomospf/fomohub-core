type muscle_contributions = {
  muscle: string;
  weight: number;
}[];

export interface ExerciseCandidate {
  id: string;
  name: string;
  muscle_groups: muscle_contributions;
  movement_pattern: string;
  equipment: string;
  difficulty_level: string;
  priority_type: string;
  fatigue_score: number;
  stimulus_type: string;
  is_compound: boolean;
  unilateral: boolean;
  muscle_contributions: {
    muscle: string;
    weight: number;
  }[];
}
