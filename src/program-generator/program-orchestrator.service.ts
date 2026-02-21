import { Injectable } from '@nestjs/common';
import { ProgramGeneratorService } from './program-generator.service';
import { ProgressionEngineService } from '../progression-engine/progression-engine.service';
import { createClient } from '@supabase/supabase-js';
import { PhaseType } from './phases-type.types';
import { v4 as uuidv4 } from 'uuid';
import { AdaptiveWorkoutEngine } from 'src/training-engine/adaptive-workout.engine';
import { ExercisePrescription } from 'src/progression-engine/progression.types';

interface ProgramDay {
  dayOrder: number;
  name: string;
  muscleGroups: string[];
  goals: string[];
  exercises: ExercisePrescription[];
}

@Injectable()
export class ProgramOrchestratorService {
  private _supabaseClient: any;

  private get supabase() {
    if (!this._supabaseClient) {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase environment variables (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) are missing.');
      }
      this._supabaseClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      );
    }
    return this._supabaseClient;
  }

  constructor(
    private readonly programGenerator: ProgramGeneratorService,
    private readonly progressionEngine: ProgressionEngineService,
    private readonly adaptiveEngine: AdaptiveWorkoutEngine,
  ) { }

  async generateProgram(payload: {
    userId: string;
    goals: string[];
    experienceLevel: string;
    totalWeeks: number;
    weeklyFrequency: number;
    equipment?: string[];
    workoutType: 'ppl' | 'upper_lower' | 'full_body';
  }) {

    if ((payload as any).goal && !payload.goals) {
      payload.goals = [(payload as any).goal];
    }
    if (!payload.goals || payload.goals.length === 0) {
      payload.goals = ['hypertrophy'];
    }

    const { userId, totalWeeks, weeklyFrequency, goals } = payload;
    const primaryGoal = goals[0];

    const phaseSchedule = this.resolvePhases(totalWeeks);
    const targetVolume = this.resolveVolume(goals);

    const splitStructure = this.resolveSplit(
      payload.workoutType,
      weeklyFrequency,
    );

    const allWeeks: any[] = [];

    const { data: progressionProfile } =
      await this.supabase
        .from('exercise_progression_profile')
        .select('*')
        .eq('user_id', userId);

    const progressionMap: Record<string, any> = {};
    progressionProfile?.forEach(p => {
      progressionMap[p.exercise_id] = p;
    });

    for (const phaseInfo of phaseSchedule) {

      const baseWeek = await this.programGenerator.generateWeek({
        days: splitStructure,
        level: payload.experienceLevel,
        equipment: payload.equipment,
        baseContext: {
          goals: payload.goals,
          phaseType: phaseInfo.phase,
          weekNumber: phaseInfo.weekNumber,
          usedExercisesLastWeeks: [],
          fatigueLimit: 12,
          targetWeeklyVolume: targetVolume,
          weeklyFrequency,
        },
        targetWeeklyVolume: targetVolume,
      });

      const adaptedDays: ProgramDay[] = [];

      for (let dayIndex = 0; dayIndex < baseWeek.weekPlan.length; dayIndex++) {

        const exercises = baseWeek.weekPlan[dayIndex];
        if (!splitStructure[dayIndex]) continue;
        const slots = splitStructure[dayIndex].slots;

        const prescription =
          this.adaptiveEngine.buildPrescription({
            exercises,
            phase: phaseInfo.phase,
            progressionProfile: progressionMap,
            goals: payload.goals,
          });

        const musclesOfDay = this.extractMusclesFromSlots(slots);

        adaptedDays.push({
          dayOrder: dayIndex + 1,
          name: `Semana ${phaseInfo.weekNumber} - Dia ${dayIndex + 1} (${musclesOfDay.join(' e ')})`,
          muscleGroups: musclesOfDay,
          goals: payload.goals,
          exercises: prescription,
        });
      }

      allWeeks.push({
        weekNumber: phaseInfo.weekNumber,
        phase: phaseInfo.phase,
        days: adaptedDays,
      });
    }

    const programId = await this.persistProgram(
      userId,
      allWeeks,
      payload,
    );

    return {
      protocol: {
        id: programId,
        name: `Protocolo ${payload.totalWeeks} semanas - ${goals.join(' + ').toUpperCase()}`,
        goal: goals.join(','),
        workoutType: payload.workoutType,
        totalWeeks: payload.totalWeeks,
        weeklyFrequency: payload.weeklyFrequency,
        weeks: allWeeks,
        createdAt: new Date().toISOString()
      }
    };
  }

  async getProgram(programId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return data;
  }

  private resolveSplit(type: string, weeklyFrequency: number) {

    if (type === 'ppl') {
      const base = [
        { slots: ['horizontal_press', 'vertical_press', 'triceps'] },
        { slots: ['vertical_pull', 'horizontal_pull', 'biceps'] },
        { slots: ['squat', 'hip_hinge', 'abs'] },
      ];

      return this.distributeByFrequency(base, weeklyFrequency);
    }

    if (type === 'upper_lower') {
      const base = [
        { slots: ['horizontal_press', 'vertical_pull', 'triceps', 'biceps'] },
        { slots: ['squat', 'hip_hinge', 'abs'] },
      ];

      return this.distributeByFrequency(base, weeklyFrequency);
    }

    const full = [
      { slots: ['horizontal_press', 'vertical_pull', 'squat', 'abs'] }
    ];

    return Array.from({ length: weeklyFrequency }, () => full[0]);
  }

  private distributeByFrequency(base: any[], frequency: number) {
    const result: any[] = [];
    for (let i = 0; i < frequency; i++) {
      result.push(base[i % base.length]);
    }
    return result;
  }

  private extractMusclesFromSlots(slots: string[]) {

    const map: Record<string, string> = {
      horizontal_press: 'Peito',
      vertical_press: 'Ombro',
      triceps: 'Tríceps',
      vertical_pull: 'Costas',
      horizontal_pull: 'Costas',
      biceps: 'Bíceps',
      squat: 'Quadríceps',
      hip_hinge: 'Posterior',
      abs: 'Abdômen',
    };

    return [...new Set(
      slots.map(s => map[s]).filter(Boolean)
    )];
  }

  private resolveVolume(goals: string[]) {
    const summedVolume: Record<string, number> = {
      chest: 0,
      back: 0,
      shoulders: 0,
      biceps: 0,
      triceps: 0,
      quads: 0,
      hamstrings: 0,
      calves: 0,
      abs: 0,
    };

    for (const goal of goals) {
      if (goal === 'hypertrophy') {
        summedVolume.chest += 12;
        summedVolume.back += 14;
        summedVolume.shoulders += 10;
        summedVolume.biceps += 8;
        summedVolume.triceps += 8;
        summedVolume.quads += 12;
        summedVolume.hamstrings += 10;
        summedVolume.calves += 6;
        summedVolume.abs += 6;
      } else if (goal === 'strength') {
        summedVolume.chest += 8;
        summedVolume.back += 10;
        summedVolume.shoulders += 6;
        summedVolume.biceps += 6;
        summedVolume.triceps += 6;
        summedVolume.quads += 8;
        summedVolume.hamstrings += 8;
        summedVolume.calves += 4;
        summedVolume.abs += 4;
      } else { // Generic matching endurance/fat_loss
        summedVolume.chest += 10;
        summedVolume.back += 12;
        summedVolume.shoulders += 8;
        summedVolume.biceps += 8;
        summedVolume.triceps += 8;
        summedVolume.quads += 10;
        summedVolume.hamstrings += 10;
        summedVolume.calves += 6;
        summedVolume.abs += 8;
      }
    }

    const averagedVolume: Record<string, number> = {};
    for (const muscle of Object.keys(summedVolume)) {
      averagedVolume[muscle] = Math.round(summedVolume[muscle] / goals.length);
    }

    return averagedVolume;
  }

  private resolvePhases(totalWeeks: number) {

    const schedule: { weekNumber: number; phase: PhaseType }[] = [];
    let currentWeek = 1;

    const blocks =
      totalWeeks <= 4
        ? [{ type: 'base' as PhaseType, weeks: totalWeeks }]
        : [
          { type: 'base' as PhaseType, weeks: 4 },
          { type: 'intensification' as PhaseType, weeks: 4 },
          { type: 'peak' as PhaseType, weeks: totalWeeks - 8 },
        ];

    for (const block of blocks) {
      for (let i = 0; i < block.weeks; i++) {
        schedule.push({
          weekNumber: currentWeek++,
          phase: block.type,
        });
      }
    }

    return schedule;
  }

  private buildPhaseRanges(program: any[]) {
    const phases: {
      phase: PhaseType;
      startWeek: number;
      endWeek: number;
    }[] = [];

    if (!program.length) return phases;

    let currentPhase: PhaseType = program[0].phase;
    let startWeek = program[0].weekNumber;

    for (let i = 1; i < program.length; i++) {
      if (program[i].phase !== currentPhase) {
        phases.push({
          phase: currentPhase,
          startWeek,
          endWeek: program[i - 1].weekNumber,
        });

        currentPhase = program[i].phase;
        startWeek = program[i].weekNumber;
      }
    }

    phases.push({
      phase: currentPhase,
      startWeek,
      endWeek: program[program.length - 1].weekNumber,
    });

    return phases;
  }

  private async persistProgram(
    userId: string,
    program: any[],
    payload: any,
  ) {

    const programId = uuidv4();

    const phaseRanges = this.buildPhaseRanges(program);

    const rpcPayload = {
      programId,
      userId,
      name: `Protocolo ${payload.totalWeeks} semanas - ${payload.goals.join(' + ').toUpperCase()}`,
      split: payload.workoutType,
      goal: payload.goals.join(','),
      experienceLevel: payload.experienceLevel,
      totalWeeks: payload.totalWeeks,
      weeklyFrequency: payload.weeklyFrequency,
      sessionDuration: 60,
      phases: phaseRanges,
      weeks: program,
    };

    const { error } = await this.supabase.rpc(
      'create_full_training_program',
      { payload: rpcPayload }
    );

    if (error) throw error;

    return programId;
  }


}
