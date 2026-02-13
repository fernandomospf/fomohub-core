import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

interface GenerateWorkoutInput {
  age: number;
  goal: string;
  level: string;
  time: number;
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não definida');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateWorkout(data: GenerateWorkoutInput) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 800,
        messages: [
          {
            role: 'system',
            content:
              'Você é um personal trainer profissional especializado em treinos personalizados seguros.',
          },
          {
            role: 'user',
            content: `
Gere um treino personalizado com base nos dados:

Idade: ${data.age}
Objetivo: ${data.goal}
Nível: ${data.level}
Tempo disponível: ${data.time} minutos

Regras:
- Não inclua explicações.
- Retorne apenas JSON válido.
- Não adicione texto fora do JSON.

Formato obrigatório:

{
  "name": "string",
  "duration": number,
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": "string",
      "rest": "string"
    }
  ]
}
`,
          },
        ],
      });

      const content = response.choices?.[0]?.message?.content;

      if (!content) {
        throw new InternalServerErrorException(
          'Resposta vazia da OpenAI',
        );
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('Erro ao gerar treino com IA:', error);
      throw new InternalServerErrorException(
        'Erro ao gerar treino com IA',
      );
    }
  }
}
