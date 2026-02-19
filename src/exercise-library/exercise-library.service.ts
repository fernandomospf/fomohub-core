import { Injectable } from "@nestjs/common";
import { ExerciseCandidate } from "./exercise-candidate.interface";
import { SupabaseService } from "../supabase/supabase.service";


@Injectable()
export class ExerciseLibraryService {
    constructor(
        private readonly supabase: SupabaseService
    ) { }

    async findCandidates(
        pattern: string,
        level: string,
        equipment?: string[],
    ): Promise<ExerciseCandidate[]> {

        const allowedLevels = this.resolveAllowedLevels(level);

        let query = this.supabase.client
            .from('exercise_library')
            .select('*')
            .eq('movement_pattern', pattern)
            .in('difficulty_level', allowedLevels);


        if (equipment?.length) {
            query = query.in('equipment', equipment);
        }

        const { data, error } = await query;

        if (error) throw error;

        return (data ?? []).map((ex) => ({
            id: ex.id,
            name: ex.name,
            muscle_groups: ex.muscle_groups,
            movement_pattern: ex.movement_pattern,
            equipment: ex.equipment,
            difficulty_level: ex.difficulty_level,
            priority_type: ex.priority_type,
            fatigue_score: Number(ex.fatigue_score),
            stimulus_type: ex.stimulus_type,
            is_compound: ex.is_compound,
            unilateral: ex.unilateral,
            muscle_contributions: ex.muscle_contributions ?? [],
        }));

    }

    async findAll(
        level: string,
        equipment?: string[],
    ): Promise<ExerciseCandidate[]> {

        let query = this.supabase.client
            .from('exercise_library')
            .select('*')
            .eq('difficulty_level', level);

        if (equipment?.length) {
            query = query.in('equipment', equipment);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return data as ExerciseCandidate[];
    }

    async insertExercise(exercise: any) {

        const { data, error } = await this.supabase.client
            .from('exercise_library')
            .upsert({
                name: exercise.name,
                muscle_groups: exercise.muscle_groups,
                movement_pattern: exercise.movement_pattern,
                equipment: exercise.equipment,
                difficulty_level: exercise.difficulty_level,
                priority_type: exercise.priority_type,
                fatigue_score: exercise.fatigue_score,
                stimulus_type: exercise.stimulus_type,
                is_compound: exercise.is_compound,
                unilateral: exercise.unilateral,
                muscle_contributions: exercise.muscle_contributions,
            }, { onConflict: 'name' });

        if (error) {
            console.error('Erro ao inserir exercício IA:', error);
        }

        return data;
    }


    private resolveAllowedLevels(level: string) {
        if (level === 'iniciante') return ['iniciante'];
        if (level === 'intermediario') return ['iniciante', 'intermediario'];
        return ['iniciante', 'intermediario', 'avancado'];
    }
}
