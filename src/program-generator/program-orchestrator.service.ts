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
    exercises: ExercisePrescription[];
}


@Injectable()
export class ProgramOrchestratorService {
    private supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    constructor(
        private readonly programGenerator: ProgramGeneratorService,
        private readonly progressionEngine: ProgressionEngineService,
        private readonly adaptiveEngine: AdaptiveWorkoutEngine,
    ) { }

    async generateProgram(payload: {
        userId: string;
        goal: 'hypertrophy' | 'strength' | 'endurance';
        experienceLevel: string;
        totalWeeks: number;
        equipment?: string[];
        split: 'ppl' | 'upper_lower' | 'full_body';
    }) {

        const { userId, totalWeeks } = payload;

        const phaseSchedule = this.resolvePhases(totalWeeks);
        const allWeeks: any[] = [];

        const targetVolume = this.resolveVolume(payload.goal);
        const splitStructure = this.resolveSplit(payload.split);

        // Buscar profile adaptativo do usuário
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
                    goal: payload.goal,
                    phaseType: phaseInfo.phase,
                    weekNumber: phaseInfo.weekNumber,
                    usedExercisesLastWeeks: [],
                    fatigueLimit: 12,
                    targetWeeklyVolume: targetVolume,
                    weeklyFrequency: splitStructure.length,
                },
                targetWeeklyVolume: targetVolume,
            });

            const adaptedDays: ProgramDay[] = [];

            for (let dayIndex = 0; dayIndex < baseWeek.weekPlan.length; dayIndex++) {

                const exercises = baseWeek.weekPlan[dayIndex];

                const prescription =
                    this.adaptiveEngine.buildPrescription({
                        exercises,
                        phase: phaseInfo.phase,
                        progressionProfile: progressionMap,
                    });

                adaptedDays.push({
                    dayOrder: dayIndex + 1,
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
            programId,
            weeks: allWeeks,
        };
    }

    async getProgram(programId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('full_training_program_view')
            .select('*')
            .eq('program_id', programId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return {
            id: data.program_id,
            name: data.program_name,
            totalWeeks: data.total_weeks,
            split: data.split,
            phases: data.phases ?? [],
            weeks: data.weeks ?? [],
        };
    }

    private resolveSplit(split: string) {
        if (split === 'ppl') {
            return [
                {
                    slots: [
                        'horizontal_press',
                        'horizontal_press',
                        'vertical_press',
                        'shoulder_abduction',
                        'triceps',
                        'triceps'
                    ]
                },
                {
                    slots: [
                        'vertical_pull',
                        'vertical_pull',
                        'horizontal_pull',
                        'biceps',
                        'biceps',
                        'biceps'
                    ]
                },
                {
                    slots: [
                        'squat',
                        'hip_hinge',
                        'calves'
                    ]
                },
            ];
        }

        if (split === 'upper_lower') {
            return [
                {
                    slots: [
                        'horizontal_press',
                        'vertical_pull',
                        'triceps',
                        'biceps'
                    ]
                },
                {
                    slots: [
                        'squat',
                        'hip_hinge',
                        'calves'
                    ]
                },
            ];
        }

        return [
            {
                slots: [
                    'horizontal_press',
                    'vertical_pull',
                    'squat'
                ]
            },
            {
                slots: [
                    'vertical_press',
                    'horizontal_pull',
                    'hip_hinge'
                ]
            },
            {
                slots: [
                    'squat',
                    'biceps',
                    'triceps'
                ]
            },
        ];
    }

    private resolveVolume(goal: string) {
        if (goal === 'hypertrophy') {
            return {
                chest: 12,
                back: 14,
                shoulders: 10,
                biceps: 8,
                triceps: 8,
                quads: 12,
                hamstrings: 10,
                glutes: 8,
                calves: 6,
                abs: 6,
            };
        }

        return {
            chest: 8,
            back: 10,
            shoulders: 6,
            biceps: 6,
            triceps: 6,
            quads: 8,
            hamstrings: 8,
            glutes: 6,
            calves: 4,
            abs: 4,
        };
    }

    private resolvePhases(totalWeeks: number): {
        weekNumber: number;
        phase: PhaseType;
    }[] {
        const schedule: {
            weekNumber: number;
            phase: PhaseType;
        }[] = [];

        let currentWeek = 1;

        const phaseBlocks =
            totalWeeks <= 4
                ? [{ type: 'base' as PhaseType, weeks: totalWeeks }]
                : totalWeeks <= 12
                    ? [
                        { type: 'base' as PhaseType, weeks: 4 },
                        { type: 'intensification' as PhaseType, weeks: 4 },
                        { type: 'peak' as PhaseType, weeks: totalWeeks - 8 },
                    ]
                    : [
                        { type: 'base' as PhaseType, weeks: 6 },
                        { type: 'intensification' as PhaseType, weeks: 8 },
                        { type: 'peak' as PhaseType, weeks: totalWeeks - 14 },
                        { type: 'deload' as PhaseType, weeks: 1 },
                    ];

        for (const block of phaseBlocks) {
            for (let i = 0; i < block.weeks; i++) {
                schedule.push({
                    weekNumber: currentWeek,
                    phase: block.type,
                });
                currentWeek++;
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
            name: `Programa ${payload.goal}`,
            split: payload.split,
            goal: payload.goal,
            experienceLevel: payload.experienceLevel,
            totalWeeks: payload.totalWeeks,
            weeklyFrequency: this.resolveSplit(payload.split).length,
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
