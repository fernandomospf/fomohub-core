import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StartWorkoutSessionDto } from './dto/start-workout-session.dto';
import { AuthenticateRequest } from 'reqGuard';
import { AddExerciseToSessionDto } from './dto/addExerciseToSession.dto';
import { AddSetToSessionDto } from './dto/addSetToSession.dto';


@Injectable()
export class WorkoutPlansService {

  async createPlan(req, dto) {
    const { data: plan, error } = await req.supabase
      .from('workout_plans')
      .insert({
        user_id: req.user.id,
        name: dto.name,
        is_public: dto.isPublic ?? false,
        created_at: new Date(),
        updated_at: new Date(),
        muscle_groups: dto.muscleGroups,
        goals: dto.goals,
        training_time: dto.trainingTime,
        workout_type: dto.workoutType,
      })
      .select()
      .single();

    if (error) throw error;

    const exercises = dto.exercises.map((e) => ({
      workout_plan_id: plan.id,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight,
      rest_time_seconds: e.restTimeSeconds,
    }));

    const { error: exError } = await req.supabase
      .from('workout_exercises')
      .insert(exercises);

    if (exError) throw exError;

    return plan;
  }

  async listMyPlans(req) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const userFitnessData = await this.getUserFitnessData(req, userId);

    const { data: plans, error } = await supabase
      .from('workout_plans')
      .select(`
      *,
      workout_exercises (*)
    `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!plans?.length) return [];

    const planIds = plans.map(p => p.id);

    const { data: userLikes } = await supabase
      .from('workout_plan_likes')
      .select('workout_plan_id')
      .eq('user_id', userId);

    const { data: userFavorites } = await supabase
      .from('workout_plan_favorites')
      .select('workout_plan_id')
      .eq('user_id', userId);

    const { data: allLikes } = await supabase
      .from('workout_plan_likes')
      .select('workout_plan_id')
      .in('workout_plan_id', planIds);

    const likedSet = new Set(
      (userLikes ?? []).map(l => l.workout_plan_id),
    );

    const favoriteSet = new Set(
      (userFavorites ?? []).map(f => f.workout_plan_id),
    );

    const likesCountMap = (allLikes ?? []).reduce((acc, like) => {
      acc[like.workout_plan_id] =
        (acc[like.workout_plan_id] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return plans.map(plan => {
      const met = this.getMetByPlan(plan);
      const calories = this.calculateCaloriesBurned(
        userFitnessData?.weight_kg,
        Number(plan.training_time),
        met,
      );

      return {
        ...plan,
        calories,
        is_liked: likedSet.has(plan.id),
        is_favorited: favoriteSet.has(plan.id),
        likes_count: likesCountMap[plan.id] ?? 0,
      };
    });
  }

  async listMyFavoritePlans(req) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const userFitnessData = await this.getUserFitnessData(req, userId);

    const { data: favorites, error: favError } = await supabase
      .from('workout_plan_favorites')
      .select('workout_plan_id')
      .eq('user_id', userId);

    if (favError) throw favError;
    if (!favorites?.length) return [];

    const favoritePlanIds = favorites.map(f => f.workout_plan_id);

    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')
      .in('id', favoritePlanIds)
      .order('created_at', { ascending: false });

    if (plansError) throw plansError;
    if (!plans?.length) return [];

    const planIds = plans.map(p => p.id);

    const { data: allLikes } = await supabase
      .from('workout_plan_likes')
      .select('workout_plan_id')
      .in('workout_plan_id', planIds);

    const likesCountMap = (allLikes ?? []).reduce((acc, like) => {
      acc[like.workout_plan_id] =
        (acc[like.workout_plan_id] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .in('workout_plan_id', planIds);

    if (exercisesError) throw exercisesError;

    const exercisesByPlan = exercises.reduce((acc, ex) => {
      if (!acc[ex.workout_plan_id]) acc[ex.workout_plan_id] = [];
      acc[ex.workout_plan_id].push(ex);
      return acc;
    }, {} as Record<string, any[]>);

    return plans.map(plan => {
      const planExercises = exercisesByPlan[plan.id] ?? [];

      const durationMinutes = this.calculatePlanDurationMinutes(planExercises);
      const primaryGoal = Array.isArray(plan.goals) ? plan.goals[0] : plan.goals;
      const met = this.getMetByGoal(primaryGoal);

      const calories = this.calculateCaloriesBurned(
        userFitnessData.weight_kg,
        durationMinutes,
        met,
      );

      return {
        ...plan,
        calories,
        estimated_duration_minutes: Math.round(durationMinutes),
        workout_exercises: planExercises,
        is_favorited: true,
        likes_count: likesCountMap[plan.id] ?? 0,
      };
    });
  }

  async listMyLikedPlans(req) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data: lastMeasurement, error: measurementError } =
      await supabase
        .from('body_measurements')
        .select('weight_kg')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (measurementError) {
      throw new InternalServerErrorException(measurementError.message);
    }

    const { data: likes, error: likesError } = await supabase
      .from('workout_plan_likes')
      .select('workout_plan_id')
      .eq('user_id', userId);

    if (likesError) throw likesError;
    if (!likes?.length) return [];

    const likedPlanIds = likes.map(l => l.workout_plan_id);

    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select(`
      *,
      workout_exercises (*)
    `)
      .in('id', likedPlanIds);

    if (plansError) throw plansError;
    if (!plans?.length) return [];

    const planIds = plans.map((plan) => plan.id);

    const { data: allLikes } = await supabase
      .from('workout_plan_likes')
      .select('workout_plan_id')
      .in('workout_plan_id', planIds);

    const likesCountMap = (allLikes ?? []).reduce((acc, like) => {
      acc[like.workout_plan_id] =
        (acc[like.workout_plan_id] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);


    return plans.map(plan => {
      const primaryGoal =
        Array.isArray(plan.goals) && plan.goals.length > 0
          ? plan.goals[0]
          : null;

      const met = this.getMetByGoal(primaryGoal);

      const durationMinutes = plan.training_time
        ? Number(plan.training_time)
        : this.calculatePlanDurationMinutes(plan.workout_exercises ?? []);

      const calories = this.calculateCaloriesBurned(
        lastMeasurement?.weight_kg,
        durationMinutes,
        met,
      );

      return {
        ...plan,
        calories,
        is_liked: true,
        likes_count: likesCountMap[plan.id] ?? 0,
      };
    });
  }

  async listPublicPlans(req) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data: lastMeasurement, error: measurementError } =
      await supabase
        .from('body_measurements')
        .select('weight_kg')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (measurementError) {
      throw new InternalServerErrorException(measurementError.message);
    }

    const { data: likes, error: likesError } = await supabase
      .from('workout_plan_likes')
      .select('workout_plan_id')
      .eq('user_id', userId);

    const { data: favorites, error: favError } = await supabase
      .from('workout_plan_favorites')
      .select('workout_plan_id')
      .eq('user_id', userId);

    if (likesError) throw likesError;
    if (favError) throw favError;

    const likedSet = new Set((likes ?? []).map((l) => l.workout_plan_id));
    const favoriteSet = new Set((favorites ?? []).map((f) => f.workout_plan_id));

    const { data: plans, error: plansError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (plansError) throw plansError;
    if (!plans?.length) return [];

    const planIds = plans.map((p) => p.id);

    const { data: allLikes } = await supabase
      .from('workout_plan_likes')
      .select('workout_plan_id')
      .in('workout_plan_id', planIds);

    const likesCountMap = (allLikes ?? []).reduce((acc, like) => {
      acc[like.workout_plan_id] = (acc[like.workout_plan_id] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('*')
      .in('workout_plan_id', planIds);

    if (exercisesError) throw exercisesError;

    const exercisesByPlan = exercises.reduce((acc, ex) => {
      if (!acc[ex.workout_plan_id]) acc[ex.workout_plan_id] = [];
      acc[ex.workout_plan_id].push(ex);
      return acc;
    }, {} as Record<string, any[]>);

    return plans.map((plan) => {
      const planExercises = exercisesByPlan[plan.id] ?? [];
      const durationMinutes = plan.training_time
        ? Number(plan.training_time)
        : this.calculatePlanDurationMinutes(planExercises);

      const primaryGoal = Array.isArray(plan.goals) ? plan.goals[0] : plan.goals;
      const met = this.getMetByGoal(primaryGoal);

      const calories = this.calculateCaloriesBurned(
        lastMeasurement?.weight_kg,
        durationMinutes,
        met,
      );

      return {
        ...plan,
        calories,
        estimated_duration_minutes: Math.round(durationMinutes),
        workout_exercises: planExercises,
        is_liked: likedSet.has(plan.id),
        is_favorited: favoriteSet.has(plan.id),
        likes_count: likesCountMap[plan.id] ?? 0,
      };
    });
  }

  async toggleLike(req, planId: string) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { error: insertError } = await supabase
      .from('workout_plan_likes')
      .insert({
        workout_plan_id: planId,
        user_id: userId,
      });

    if (insertError?.code === '23505') {
      const { error: deleteError } = await supabase
        .from('workout_plan_likes')
        .delete()
        .eq('workout_plan_id', planId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return {
        liked: false,
      };
    }

    if (insertError) {
      throw insertError;
    }

    return {
      liked: true,
    };
  }

  async toggleFavorite(req, planId: string) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { error: insertError } = await supabase
      .from('workout_plan_favorites')
      .insert({
        workout_plan_id: planId,
        user_id: userId,
      });

    if (insertError?.code === '23505') {
      const { error: deleteError } = await supabase
        .from('workout_plan_favorites')
        .delete()
        .eq('workout_plan_id', planId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return {
        favorite: false,
      };
    }

    if (insertError) {
      throw insertError;
    }

    return {
      favorite: true,
    };
  }

  async getWorkoutById(
    req,
    dto: { planId: string },
  ) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('workout_exercises_with_plan')
      .select('*')
      .eq('workout_plan_id', dto.planId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const {
      workout_plan_id,
      workout_plan_name,
      training_time,
      goals,
      muscle_groups,
      workout_type,
      is_public,
    } = data[0];

    const { data: lastMeasurement, error: measurementError } =
      await supabase
        .from('body_measurements')
        .select('weight_kg')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (measurementError) {
      throw new InternalServerErrorException(measurementError.message);
    }

    const weightKg = lastMeasurement?.weight_kg ?? null;

    const met = this.getMetByPlan({
      goals,
      muscle_groups,
    });

    const calories = this.calculateCaloriesBurned(
      weightKg,
      Number(training_time) || 60,
      met,
    );

    const exercises = data.map(
      ({
        workout_plan_id,
        workout_plan_name,
        training_time,
        goals,
        muscle_groups,
        workout_type,
        is_public,
        ...exercise
      }) => exercise,
    );

    return {
      workout_plan_id,
      name: workout_plan_name,
      training_time,
      muscle_groups,
      goals,
      workout_type,
      is_public,
      calories,
      exercises,
    };
  }

  async startWorkoutSession(
    req: AuthenticateRequest,
    dto: StartWorkoutSessionDto
  ) {
    const supabase = req.supabase;
    const userId = req.user.id;
    const { data: openSession } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .is('finished_at', null)
      .maybeSingle();

    if (openSession) {
      throw new Error('Já existe um treino em andamento');
    }

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_plan_id: dto.planId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();



    if (error) throw error;
    return data;
  }

  async finishWorkoutSession(req: AuthenticateRequest, sessionId: string) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { error } = await supabase
      .from('workout_sessions')
      .update({
        finished_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .is('finished_at', null);

    if (error) throw error;

    return { success: true };
  }

  async addSetToSession(
    req: AuthenticateRequest,
    sessionId: string,
    dto: AddSetToSessionDto
  ) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { error: setError } = await supabase
      .from('workout_session_sets')
      .insert({
        user_id: userId,
        session_id: sessionId,
        workout_exercise_id: dto.workout_exercise_id,
        set_number: dto.set_number,
        reps: dto.reps,
        weight: dto.weight,
        executed_at: new Date().toISOString(),
      });

    if (setError) throw setError;

    const { data: sessionExercise } = await supabase
      .from('workout_session_exercises')
      .select('id, completed_sets')
      .eq('session_id', sessionId)
      .eq('workout_exercise_id', dto.workout_exercise_id)
      .maybeSingle();

    if (!sessionExercise) {
      const { error: insertError } = await supabase
        .from('workout_session_exercises')
        .insert({
          session_id: sessionId,
          workout_exercise_id: dto.workout_exercise_id,
          completed_sets: 1,
        });

      if (insertError) throw insertError;
    } else {
      const { error: updateError } = await supabase
        .from('workout_session_exercises')
        .update({
          completed_sets: sessionExercise.completed_sets + 1,
        })
        .eq('id', sessionExercise.id);

      if (updateError) throw updateError;
    }

    return { success: true };
  }

  async addExerciseToSession(
    req: AuthenticateRequest,
    sessionId: string,
    dto: AddExerciseToSessionDto,
  ) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('workout_session_exercises')
      .insert({
        session_id: sessionId,
        user_id: userId,
        workout_exercise_id: dto.workout_exercise_id,
        completed_sets: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWorkoutHistory(req: AuthenticateRequest) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('workout_session_sets')
      .select(`
      reps,
      weight,
      set_number,
      executed_at,
      workout_exercises (
        id,
        name,
        sets,
        reps,
        weight
      ),
      workout_sessions (
        started_at
      )
    `)
      .eq('user_id', userId)
      .order('executed_at', { ascending: false });

    if (error) throw error;

    return this.groupWorkoutHistory(data);
  }

  async getExerciseHistory(
    req: AuthenticateRequest,
    workoutExerciseId: string,
  ) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('workout_session_sets')
      .select(`
      reps,
      weight,
      set_number,
      executed_at,
      workout_sessions (
        started_at
      )
    `)
      .eq('user_id', userId)
      .eq('workout_exercise_id', workoutExerciseId)
      .order('executed_at', { ascending: false });

    if (error) throw error;
    if (!data?.length) return [];

    return this.groupExerciseHistoryDirect(data);
  }

  private groupExerciseHistoryDirect(rows: any[]) {
    const map = new Map<string, any>();

    for (const row of rows) {
      const date = row.workout_sessions.started_at.split('T')[0];

      if (!map.has(date)) {
        map.set(date, {
          date,
          sets: [],
        });
      }

      map.get(date).sets.push({
        set: row.set_number,
        reps: row.reps,
        weight: row.weight,
      });
    }

    return [
      {
        history: Array.from(map.values()),
      },
    ];
  }

  private groupExerciseHistory(rows: any[]) {
    const map = new Map<string, any>();

    for (const row of rows) {
      const sessionExercise = row.workout_session_exercises;
      const workoutExercise = sessionExercise?.workout_exercises;
      const session = row.workout_sessions;

      if (!workoutExercise || !session) {
        continue;
      }

      const exerciseId = workoutExercise.id;
      const date = session.started_at.split('T')[0];

      if (!map.has(exerciseId)) {
        map.set(exerciseId, {
          exercise_id: exerciseId,
          exercise_name: workoutExercise.name,
          planned_sets: workoutExercise.sets,
          planned_reps: workoutExercise.reps,
          planned_weight: workoutExercise.weight,
          history: [],
        });
      }

      const entry = map.get(exerciseId);

      let day = entry.history.find((h) => h.date === date);
      if (!day) {
        day = { date, sets: [] };
        entry.history.push(day);
      }

      day.sets.push({
        set: row.set_number,
        reps: row.reps,
        weight: row.weight,
      });
    }

    return Array.from(map.values());
  }

  private groupWorkoutHistory(rows: any[]) {
    const map = new Map();

    for (const row of rows) {
      const exercise = row.workout_session_exercises.workout_exercises;
      const date = row.workout_sessions.started_at.split('T')[0];

      if (!map.has(exercise.id)) {
        map.set(exercise.id, {
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          planned_sets: exercise.sets,
          planned_reps: exercise.reps,
          planned_weight: exercise.weight,
          history: [],
        });
      }

      const entry = map.get(exercise.id);

      let day = entry.history.find(h => h.date === date);
      if (!day) {
        day = { date, sets: [] };
        entry.history.push(day);
      }

      day.sets.push({
        set: row.set_number,
        reps: row.reps,
        weight: row.weight,
      });
    }

    return Array.from(map.values());
  }

  async getActiveWorkout(req: AuthenticateRequest, planId: string) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data: session } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('workout_plan_id', planId)
      .is('finished_at', null)
      .maybeSingle();

    if (!session) return null;

    const { data, error } = await supabase
      .from('workout_session_sets')
      .select('workout_exercise_id')
      .eq('session_id', session.id);

    if (error) throw error;

    const countMap = new Map<string, number>();

    for (const row of data ?? []) {
      countMap.set(
        row.workout_exercise_id,
        (countMap.get(row.workout_exercise_id) ?? 0) + 1,
      );
    }

    return {
      sessionId: session.id,
      exercises: Array.from(countMap.entries()).map(
        ([workout_exercise_id, completed_sets]) => ({
          workout_exercise_id,
          completed_sets,
        }),
      ),
    };
  }

  async getGoalsTags(req: AuthenticateRequest): Promise<string[]> {
    const { data, error } = await req.supabase
      .from('workout_plans')
      .select('goals')
      .eq('is_public', true)

    if (error) throw error;
    return Array.from(new Set(data?.flatMap((item) => item.goals || []) ?? []));
  }

  async getMuscleGroupsTags(req: AuthenticateRequest): Promise<string[]> {
    const { data, error } = await req.supabase
      .from('workout_plans')
      .select('muscle_groups')
      .eq('is_public', true)

    if (error) throw error;
    return Array.from(
      new Set(data?.flatMap((item) => item.muscle_groups || []) ?? []),
    );
  }

  private async getUserFitnessData(req, userId: string) {
    const { data, error } = await req.supabase
      .from('profile_fitness_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  private calculateCaloriesBurned(
    weightKg: number,
    durationMinutes: number = 60,
    met: number,
  ) {
    if (
      !Number.isFinite(weightKg) ||
      !Number.isFinite(durationMinutes) ||
      !Number.isFinite(met) ||
      durationMinutes <= 0
    ) {
      return null;
    }

    return Math.round(met * weightKg * (durationMinutes / 60));
  }

  private getMetByGoal(goal: string) {
    switch (goal) {
      case 'hipertrofia':
        return 5.0;
      case 'forca':
        return 6.0;
      default:
        return 3.5;
    }
  }

  private calculatePlanDurationMinutes(exercises: any[]) {
    if (!exercises?.length) return 0;

    return (
      exercises.reduce((total, ex) => {
        const sets = Number(ex.sets) || 0;
        const rest = Number(ex.rest_time_seconds) || 0;

        const secondsPerSet = 40 + rest;

        return total + sets * secondsPerSet;
      }, 0) / 60
    );
  }

  private getMetByPlan(plan: any) {
    const goals = Array.isArray(plan.goals) ? plan.goals : [];
    const muscleGroups = Array.isArray(plan.muscle_groups)
      ? plan.muscle_groups
      : [];

    let baseMet = 3.5;

    if (goals.includes('Hipertrofia')) baseMet = 5.0;
    if (goals.includes('Forca')) baseMet = 6.0;
    if (goals.includes('Emagrecimento')) baseMet = 6.5;

    if (muscleGroups.includes('Pernas')) baseMet += 1.0;
    if (muscleGroups.includes('Costas')) baseMet += 0.5;

    return baseMet;
  }
};
