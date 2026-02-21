export interface WorkoutExercise {
  created_at: string;
  id: string;
  name: string;
  reps: number;
  rest_time_seconds: number;
  sets: number;
  updated_at: string;
  weight: number;
  workout_plan_id: string;
}


export interface MetaPagination {
  total: number;
  page: number;
  limit: number;
  offset: number;
  lastPage: number;
}

export interface DataResponseRequest {
  id: string;
  user_id: string;
  name: string;
  is_public: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  likes_count: number;
  rating_average: number | null;
  ratings_count: number;
  source_plan_id: string | null;
  muscle_groups: string[];
  goals: string[];
  training_time: number;
  workout_type: string;
  workout_exercises: WorkoutExercise[];
}


export interface WorkoutPlansResponse {
  data: DataResponseRequest[];
  meta: MetaPagination;
}