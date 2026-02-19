import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
);

type Muscle =
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'biceps'
    | 'triceps'
    | 'quads'
    | 'hamstrings'
    | 'glutes'
    | 'calves'
    | 'abs';

interface ExerciseSeed {
    name: string;
    muscle_groups: string[];
    movement_pattern: string;
    equipment: string;
    difficulty_level: string;
    priority_type: string;
    fatigue_score: number;
    stimulus_type: string;
    is_compound: boolean;
    unilateral: boolean;
    muscle_contributions: {
        muscle: Muscle;
        weight: number;
    }[];
}

const baseExercises: ExerciseSeed[] = [

    {
        name: 'Supino com Pegada Fechada',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_press',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 0.8 },
            { muscle: 'triceps', weight: 1.0 },
        ],
    },
    {
        name: 'Supino com Halter Unilateral',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_press',
        equipment: 'dumbbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: true,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
            { muscle: 'triceps', weight: 0.5 },
            { muscle: 'abs', weight: 0.3 },
        ],
    },
    {
        name: 'Desenvolvimento Máquina',
        muscle_groups: ['shoulders'],
        movement_pattern: 'vertical_press',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'shoulders', weight: 1.0 },
            { muscle: 'triceps', weight: 0.6 },
        ],
    },
    {
        name: 'Handstand Push-Up',
        muscle_groups: ['shoulders'],
        movement_pattern: 'vertical_press',
        equipment: 'bodyweight',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 5,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'shoulders', weight: 1.0 },
            { muscle: 'triceps', weight: 0.8 },
            { muscle: 'abs', weight: 0.5 },
        ],
    },
    {
        name: 'Remada Cavalinho',
        muscle_groups: ['back'],
        movement_pattern: 'horizontal_pull',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
            { muscle: 'biceps', weight: 0.6 },
        ],
    },
    {
        name: 'Remada no TRX',
        muscle_groups: ['back'],
        movement_pattern: 'horizontal_pull',
        equipment: 'bodyweight',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
            { muscle: 'biceps', weight: 0.4 },
        ],
    },
    {
        name: 'Puxada Pegada Supinada',
        muscle_groups: ['back'],
        movement_pattern: 'vertical_pull',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
            { muscle: 'biceps', weight: 0.7 },
        ],
    },
    {
        name: 'Agachamento Frontal',
        muscle_groups: ['quads'],
        movement_pattern: 'squat',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 5,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'quads', weight: 1.0 },
            { muscle: 'abs', weight: 0.6 },
            { muscle: 'glutes', weight: 0.6 },
        ],
    },
    {
        name: 'Goblet Squat',
        muscle_groups: ['quads'],
        movement_pattern: 'squat',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'quads', weight: 1.0 },
            { muscle: 'glutes', weight: 0.7 },
        ],
    },
    {
        name: 'Levantamento Terra',
        muscle_groups: ['hamstrings'],
        movement_pattern: 'hip_hinge',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 5,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'hamstrings', weight: 1.0 },
            { muscle: 'glutes', weight: 1.0 },
            { muscle: 'back', weight: 0.6 },
        ],
    },
    {
        name: 'Terra Romeno com Halteres',
        muscle_groups: ['hamstrings'],
        movement_pattern: 'hip_hinge',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'hamstrings', weight: 1.0 },
            { muscle: 'glutes', weight: 0.9 },
        ],
    },
    {
        name: 'Bulgarian Split Squat',
        muscle_groups: ['quads'],
        movement_pattern: 'lunge',
        equipment: 'dumbbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: true,
        muscle_contributions: [
            { muscle: 'quads', weight: 1.0 },
            { muscle: 'glutes', weight: 0.9 },
        ],
    },
    {
        name: 'Glute Bridge Unilateral',
        muscle_groups: ['glutes'],
        movement_pattern: 'hip_extension',
        equipment: 'bodyweight',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: true,
        unilateral: true,
        muscle_contributions: [
            { muscle: 'glutes', weight: 1.0 },
        ],
    },
    {
        name: 'Prancha',
        muscle_groups: ['abs'],
        movement_pattern: 'trunk_stability',
        equipment: 'bodyweight',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 1,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'abs', weight: 1.0 },
        ],
    },

    {
        name: 'Prancha Lateral',
        muscle_groups: ['abs'],
        movement_pattern: 'trunk_stability',
        equipment: 'bodyweight',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 1,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: true,
        muscle_contributions: [
            { muscle: 'abs', weight: 1.0 },
        ],
    },
    {
        name: 'Supino Reto',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_press',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
            { muscle: 'triceps', weight: 0.5 },
            { muscle: 'shoulders', weight: 0.3 },
        ],
    },
    {
        name: 'Supino Inclinado',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_press',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
            { muscle: 'shoulders', weight: 0.4 },
            { muscle: 'triceps', weight: 0.5 },
        ],
    },
    {
        name: 'Supino com Halteres',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_press',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
            { muscle: 'triceps', weight: 0.5 },
        ],
    },
    {
        name: 'Crucifixo Máquina',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_adduction',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
        ],
    },
    {
        name: 'Cross Over',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_adduction',
        equipment: 'cable',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
        ],
    },
    {
        name: 'Flexão de Braço',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_press',
        equipment: 'bodyweight',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'metabolic',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
            { muscle: 'triceps', weight: 0.5 },
        ],
    },
    {
        name: 'Supino Declinado',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_press',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
            { muscle: 'triceps', weight: 0.5 },
        ],
    },
    {
        name: 'Peck Deck',
        muscle_groups: ['chest'],
        movement_pattern: 'horizontal_adduction',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'chest', weight: 1.0 },
        ],
    },
    {
        name: 'Desenvolvimento com Barra',
        muscle_groups: ['shoulders'],
        movement_pattern: 'vertical_press',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'shoulders', weight: 1.0 },
            { muscle: 'triceps', weight: 0.6 },
        ],
    },
    {
        name: 'Desenvolvimento com Halteres',
        muscle_groups: ['shoulders'],
        movement_pattern: 'vertical_press',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'shoulders', weight: 1.0 },
            { muscle: 'triceps', weight: 0.6 },
        ],
    },
    {
        name: 'Elevação Lateral',
        muscle_groups: ['shoulders'],
        movement_pattern: 'shoulder_abduction',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'shoulders', weight: 1.0 },
        ],
    },
    {
        name: 'Elevação Frontal',
        muscle_groups: ['shoulders'],
        movement_pattern: 'shoulder_flexion',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'shoulders', weight: 1.0 },
        ],
    },
    {
        name: 'Face Pull',
        muscle_groups: ['shoulders'],
        movement_pattern: 'horizontal_pull',
        equipment: 'cable',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'shoulders', weight: 0.8 },
            { muscle: 'back', weight: 0.6 },
        ],
    },
    {
        name: 'Arnold Press',
        muscle_groups: ['shoulders'],
        movement_pattern: 'vertical_press',
        equipment: 'dumbbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'shoulders', weight: 1.0 },
            { muscle: 'triceps', weight: 0.6 },
        ],
    },

    {
        name: 'Barra Fixa',
        muscle_groups: ['back'],
        movement_pattern: 'vertical_pull',
        equipment: 'bodyweight',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
            { muscle: 'biceps', weight: 0.6 },
        ],
    },
    {
        name: 'Puxada na Frente',
        muscle_groups: ['back'],
        movement_pattern: 'vertical_pull',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
            { muscle: 'biceps', weight: 0.6 },
        ],
    },
    {
        name: 'Remada Curvada',
        muscle_groups: ['back'],
        movement_pattern: 'horizontal_pull',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
            { muscle: 'biceps', weight: 0.5 },
        ],
    },
    {
        name: 'Remada Máquina',
        muscle_groups: ['back'],
        movement_pattern: 'horizontal_pull',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
            { muscle: 'biceps', weight: 0.5 },
        ],
    },
    {
        name: 'Pullover',
        muscle_groups: ['back'],
        movement_pattern: 'shoulder_extension',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
        ],
    },
    {
        name: 'Remada Unilateral',
        muscle_groups: ['back'],
        movement_pattern: 'horizontal_pull',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: true,
        muscle_contributions: [
            { muscle: 'back', weight: 1.0 },
            { muscle: 'biceps', weight: 0.5 },
        ],
    },
    {
        name: 'Encolhimento',
        muscle_groups: ['back'],
        movement_pattern: 'shrug',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'back', weight: 0.8 },
        ],
    },
    {
        name: 'Good Morning',
        muscle_groups: ['hamstrings'],
        movement_pattern: 'hip_hinge',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'hamstrings', weight: 1.0 },
            { muscle: 'glutes', weight: 0.8 },
        ],
    },

    {
        name: 'Rosca Direta',
        muscle_groups: ['biceps'],
        movement_pattern: 'elbow_flexion',
        equipment: 'barbell',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'biceps', weight: 1.0 },
        ],
    },
    {
        name: 'Rosca Alternada',
        muscle_groups: ['biceps'],
        movement_pattern: 'elbow_flexion',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: true,
        muscle_contributions: [
            { muscle: 'biceps', weight: 1.0 },
        ],
    },
    {
        name: 'Rosca Martelo',
        muscle_groups: ['biceps'],
        movement_pattern: 'elbow_flexion',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'biceps', weight: 1.0 },
        ],
    },
    {
        name: 'Tríceps Pulley',
        muscle_groups: ['triceps'],
        movement_pattern: 'elbow_extension',
        equipment: 'cable',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'triceps', weight: 1.0 },
        ],
    },
    {
        name: 'Tríceps Testa',
        muscle_groups: ['triceps'],
        movement_pattern: 'elbow_extension',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'secondary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'triceps', weight: 1.0 },
        ],
    },
    {
        name: 'Mergulho em Paralelas',
        muscle_groups: ['triceps'],
        movement_pattern: 'vertical_press',
        equipment: 'bodyweight',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'triceps', weight: 1.0 },
            { muscle: 'chest', weight: 0.6 },
        ],
    },
    {
        name: 'Agachamento',
        muscle_groups: ['quads'],
        movement_pattern: 'squat',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 5,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'quads', weight: 1.0 },
            { muscle: 'glutes', weight: 0.7 },
            { muscle: 'hamstrings', weight: 0.4 },
            { muscle: 'abs', weight: 0.3 },
        ],
    },
    {
        name: 'Leg Press',
        muscle_groups: ['quads'],
        movement_pattern: 'squat',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'quads', weight: 1.0 },
            { muscle: 'glutes', weight: 0.6 },
        ],
    },
    {
        name: 'Afundo',
        muscle_groups: ['quads'],
        movement_pattern: 'lunge',
        equipment: 'dumbbell',
        difficulty_level: 'iniciante',
        priority_type: 'primary',
        fatigue_score: 3,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: true,
        muscle_contributions: [
            { muscle: 'quads', weight: 1.0 },
            { muscle: 'glutes', weight: 0.8 },
        ],
    },
    {
        name: 'Cadeira Extensora',
        muscle_groups: ['quads'],
        movement_pattern: 'knee_extension',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'quads', weight: 1.0 },
        ],
    },
    {
        name: 'Mesa Flexora',
        muscle_groups: ['hamstrings'],
        movement_pattern: 'knee_flexion',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'hamstrings', weight: 1.0 },
        ],
    },
    {
        name: 'Stiff',
        muscle_groups: ['hamstrings'],
        movement_pattern: 'hip_hinge',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'hamstrings', weight: 1.0 },
            { muscle: 'glutes', weight: 0.9 },
        ],
    },
    {
        name: 'Elevação de Panturrilha em Pé',
        muscle_groups: ['calves'],
        movement_pattern: 'plantar_flexion',
        equipment: 'machine',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'calves', weight: 1.0 },
        ],
    },
    {
        name: 'Hip Thrust',
        muscle_groups: ['glutes'],
        movement_pattern: 'hip_extension',
        equipment: 'barbell',
        difficulty_level: 'intermediario',
        priority_type: 'primary',
        fatigue_score: 4,
        stimulus_type: 'mechanical_tension',
        is_compound: true,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'glutes', weight: 1.0 },
            { muscle: 'hamstrings', weight: 0.6 },
        ],
    },
    {
        name: 'Passada no Lugar',
        muscle_groups: ['quads'],
        movement_pattern: 'lunge',
        equipment: 'bodyweight',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 2,
        stimulus_type: 'metabolic',
        is_compound: true,
        unilateral: true,
        muscle_contributions: [
            { muscle: 'quads', weight: 1.0 },
            { muscle: 'glutes', weight: 0.8 },
        ],
    },
    {
        name: 'Abdominal Crunch',
        muscle_groups: ['abs'],
        movement_pattern: 'trunk_flexion',
        equipment: 'bodyweight',
        difficulty_level: 'iniciante',
        priority_type: 'secondary',
        fatigue_score: 1,
        stimulus_type: 'metabolic',
        is_compound: false,
        unilateral: false,
        muscle_contributions: [
            { muscle: 'abs', weight: 1.0 },
        ],
    },

];

function generateVariations(baseExercises: ExerciseSeed[]): ExerciseSeed[] {
    const variations: ExerciseSeed[] = [];

    const equipmentMap: Record<string, string[]> = {
        barbell: ['dumbbell', 'machine'],
        dumbbell: ['barbell', 'cable'],
        machine: ['cable'],
        cable: ['machine'],
        bodyweight: ['machine'],
    };

    for (const ex of baseExercises) {

        if (!ex.unilateral && ex.is_compound) {
            variations.push({
                ...ex,
                name: `${ex.name} Unilateral`,
                unilateral: true,
                fatigue_score: Math.max(2, ex.fatigue_score - 1),
            });
        }

        if (ex.stimulus_type === 'mechanical_tension') {
            variations.push({
                ...ex,
                name: `${ex.name} Drop Set`,
                stimulus_type: 'metabolic',
                fatigue_score: Math.max(1, ex.fatigue_score - 1),
                priority_type: 'secondary',
            });
        }

        const alternatives = equipmentMap[ex.equipment];
        if (alternatives) {
            for (const alt of alternatives) {
                variations.push({
                    ...ex,
                    name: `${ex.name} (${alt})`,
                    equipment: alt,
                    fatigue_score: ex.fatigue_score,
                });
            }
        }

        if (ex.difficulty_level === 'iniciante') {
            variations.push({
                ...ex,
                name: `${ex.name} Avançado`,
                difficulty_level: 'intermediario',
                fatigue_score: ex.fatigue_score + 1,
            });
        }
    }

    return variations;
}

const exercises = [
    ...baseExercises,
    ...generateVariations(baseExercises)
];

async function runSeed() {
    for (const exercise of exercises) {
        const { error } = await supabase
            .from('exercise_library')
            .upsert(exercise, { onConflict: 'name' });

        if (error) {
            console.error(`Erro ao inserir ${exercise.name}`, error);
        } else {
            console.log(`Inserido: ${exercise.name}`);
        }
    }

    console.log('Seed finalizado.');
}

runSeed();
