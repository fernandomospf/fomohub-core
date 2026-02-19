import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { AuthenticateRequest } from 'reqGuard';
import { WorkoutPlansService } from 'src/workout-plans/workout-plans.service';

interface GenerateWorkoutInput {
  goal: string;
  time: number;
  muscles: string[];
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(private readonly workoutPlansService: WorkoutPlansService,) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não definida');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateWorkout(req: AuthenticateRequest, input: GenerateWorkoutInput) {
    const supabase = req.supabase;
    const userId = req.user.id;

    try {
      const { count } = await supabase
        .from('ai_workout_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if ((count ?? 0) >= 14) {
        throw new ForbiddenException('Limite de 14 treinos gerados atingido.');
      }

      const { data: userData } = await supabase
        .from('profile_fitness_data')
        .select('birth_date, experience_level, gender, training_frequency, height_cm')
        .eq('user_id', userId)
        .maybeSingle();

      if (!userData) {
        throw new InternalServerErrorException('Dados de fitness não encontrados');
      }

      const { data: measurements } = await supabase
        .from('body_measurements')
        .select('weight_kg')
        .eq('user_id', userId)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!measurements) {
        throw new InternalServerErrorException('Dados de medidas não encontrados');
      }

      const age =
        new Date().getFullYear() -
        new Date(userData.birth_date).getFullYear();

      const weight_kg = measurements.weight_kg;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content:
              'Você é um personal trainer profissional especializado em treinos personalizados seguros e estruturados para banco de dados.',
          },
          {
            role: 'user',
            content: `
Gere um treino personalizado com base nos dados:

Idade: ${age}
Objetivo: ${input.goal}
Nível: ${userData.experience_level}
Frequência: ${userData.training_frequency}
Tempo disponível: ${input.time}
Grupos musculares: ${input.muscles.join(', ')}
Peso: ${weight_kg}
Altura: ${userData.height_cm}
Gênero: ${userData.gender}

REGRAS:
- JSON válido apenas
- Sem texto fora do JSON
- Máximo 8 exercícios
- restTimeSeconds deve ser número
- weight deve ser número
- reps deve ser apenas número (ex: 10) ⚠️ NÃO usar "8-10"
- Nome do treino deve ter a flag [AI] no inicio

FORMATO:
{
  "name": "string",
  "isPublic": false,
  "muscleGroups": ["string"],
  "goals": ["string"],
  "trainingTime": number,
  "workoutType": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": number,
      "weight": number,
      "restTimeSeconds": number
    }
  ]
}
`
          }
        ],
      });

      const content = response.choices?.[0]?.message?.content;

      if (!content) {
        throw new InternalServerErrorException('Resposta vazia da OpenAI');
      }

      const parsed = JSON.parse(content);

      parsed.exercises = parsed.exercises.map((e: any) => ({
        name: e.name,
        sets: Number(e.sets),
        reps: Number(e.reps),
        weight: Number(e.weight ?? 0),
        restTimeSeconds: Number(e.restTimeSeconds),
      }));

      const plan = await this.workoutPlansService.createPlan(req, parsed);

      await supabase
        .from('ai_workout_generations')
        .insert({ user_id: userId });

      return plan;

    } catch (error) {
      console.error('Erro ao gerar treino com IA:', error);
      throw new InternalServerErrorException('Erro ao gerar treino com IA');
    }
  }

  async remainingUserCredit(req: AuthenticateRequest) {
    const supabase = req.supabase;
    const userId = req.user.id;

    try {
      const { count } = await supabase
        .from('ai_workout_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if ((count ?? 0) >= 14) {
        throw new ForbiddenException('Limite de 14 treinos gerados atingido.');
      }

      return 14 - (count ?? 0);

    } catch (error) {
      console.error('Erro ao gerar treino com IA:', error);
      throw new InternalServerErrorException('Erro ao gerar treino com IA');
    }
  }

  async generateLibraryVariations(
    level: string,
    slots: string[],
    equipment?: string[],
  ) {

    const prompt = `
Gere 10 exercícios de musculação para academia.

Nível: ${level}
Slots: ${slots.join(',')}
Equipamentos disponíveis: ${equipment?.join(',') ?? 'todos'}

Formato JSON puro:
[
  {
    "name": "string",
    "muscle_groups": ["string"],
    "movement_pattern": "string",
    "equipment": "string",
    "difficulty_level": "string",
    "priority_type": "primary" | "secondary",
    "fatigue_score": number,
    "stimulus_type": "mechanical_tension" | "metabolic",
    "is_compound": boolean,
    "unilateral": boolean,
    "muscle_contributions": [
      { "muscle": "string", "weight": number }
    ]
  }
]
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista em biomecânica criando exercícios para banco de dados.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) return [];

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch {
      return [];
    }
  }

}
