import { Injectable } from '@nestjs/common';
import { AuthenticateRequest } from 'reqGuard';
import { OnboardingDto } from 'src/dto/onboarding.dto';
import { UpdateMeasurementsDto } from 'src/dto/updateMeasurements.dto';

@Injectable()
export class ProfilesService {

  async findMe(req: AuthenticateRequest) {
    const { data, error } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: created, error: createError } = await req.supabase
        .from('profiles')
        .insert({
          id: req.user.id,
          email: req.user.email,
        })
        .select()
        .single();

      if (createError) throw createError;
      return created;
    }

    return data;
  }

  async completeOnboarding(req: AuthenticateRequest, dto: OnboardingDto) {
    const supabase = req.supabase;
    const userId = req.user.id;
    const { error: fitnessError } = await supabase
      .from('profile_fitness_data')
      .upsert({
        user_id: userId,
        social_name: dto.fitnessData.socialName,
        birth_date: dto.fitnessData.birthDate,
        gender: dto.fitnessData.gender,
        height_cm: dto.fitnessData.heightCm,
        goal: dto.fitnessData.goal,
        experience_level: dto.fitnessData.experienceLevel,
        training_frequency: dto.fitnessData.trainingFrequency,
        updated_at: new Date()
      });

    const { error: bodyError } = await supabase
      .from('body_measurements')
      .upsert({
        user_id: userId,
        weight_kg: dto.fitnessData.weightKg,
      })

    if (fitnessError || bodyError) throw fitnessError || bodyError;

    const { error: parqError } = await supabase
      .from('profile_parq_answers')
      .upsert({
        user_id: userId,
        has_heart_condition: dto.parq.hasHeartCondition,
        chest_pain_during_activity: dto.parq.chestPainDuringActivity,
        chest_pain_last_month: dto.parq.chestPainLastMonth,
        dizziness_or_fainting: dto.parq.dizzinessOrFainting,
        bone_or_joint_problem: dto.parq.boneOrJointProblem,
        uses_heart_or_pressure_medication: dto.parq.usesHeartOrPressureMedication,
        other_reason_not_to_exercise: dto.parq.otherReasonNotToExercise
      });

    if (parqError) throw parqError;

    const { error: consentError } = await supabase
      .from('profile_consents')
      .insert({
        user_id: userId,
        consent_type: dto.consent.type,
        consent_version: dto.consent.version,
        accepted: true
      });

    if (consentError) throw consentError;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date()
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    return { success: true };
  }

  async profileData(req: AuthenticateRequest) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data: measurements, error: weightError } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (weightError) throw weightError;

    const { data: fitnessData, error: fitnessError } = await supabase
      .from('profile_fitness_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fitnessError) throw fitnessError;

    return {
      ...fitnessData,
      measurements: measurements,
    };
  }

  async addMeasurement(req: AuthenticateRequest, dto: UpdateMeasurementsDto) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data: last } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = {
      user_id: userId,
      weight_kg: dto.weight_kg ?? last?.weight_kg,
      chest_cm: dto.chest_cm ?? last?.chest_cm,
      biceps_right_cm: dto.biceps_right_cm ?? last?.biceps_right_cm,
      biceps_left_cm: dto.biceps_left_cm ?? last?.biceps_left_cm,
      waist_abdomen_cm: dto.waist_abdomen_cm ?? last?.waist_abdomen_cm,
      thigh_right_cm: dto.thigh_right_cm ?? last?.thigh_right_cm,
      thigh_left_cm: dto.thigh_left_cm ?? last?.thigh_left_cm,
      calf_right_cm: dto.calf_right_cm ?? last?.calf_right_cm,
      calf_left_cm: dto.calf_left_cm ?? last?.calf_left_cm,
      forearm_right_cm: dto.forearm_right_cm ?? last?.forearm_right_cm,
      forearm_left_cm: dto.forearm_left_cm ?? last?.forearm_left_cm,
      hip_cm: dto.hip_cm ?? last?.hip_cm,
      measured_at: new Date().toISOString(),
    };

    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    const { error } = await supabase
      .from('body_measurements')
      .insert(payload);

    if (error) throw error;

    return { success: true };
  }

async offensiveDays(req: AuthenticateRequest) {
  const supabase = req.supabase;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('finished_at')
    .eq('user_id', userId)
    .order('finished_at', { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return 0;

  const workoutDates = data.map(d => {
    const date = new Date(d.finished_at);
    date.setHours(0,0,0,0);
    return date;
  });

  const today = new Date();
  today.setHours(0,0,0,0);

  const getWeekKey = (date: Date) => {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (1000 * 60 * 60 * 24));
    const week = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
    return `${date.getFullYear()}-${week}`;
  };

  const weeks: Record<string, Set<string>> = {};

  workoutDates.forEach(d => {
    const key = getWeekKey(d);
    if (!weeks[key]) weeks[key] = new Set();
    weeks[key].add(d.toISOString().slice(0,10));
  });

  let streak = 0;

  const sortedWeeks = Object.keys(weeks).sort();
  for (let weekKey of sortedWeeks) {
    const weekDates = weeks[weekKey];

    const daysInWeek = Array.from({ length: 7 }, (_, i) => i);

    const misses = 7 - weekDates.size;

    if (misses >= 2) {
      streak = 0;
    } else {
      streak += weekDates.size;
    }
  }

  return streak;
}

}