import { Injectable } from '@nestjs/common';
import { ExerciseCandidate } from 'src/exercise-library/exercise-candidate.interface';
import { WeekPrescription } from './progression.types';

@Injectable()
export class ProgressionEngineService {

  generateWeeks(params: {
    baseWeek: ExerciseCandidate[][];
    totalWeeks: number;
    phaseType: 'base' | 'intensification' | 'peak' | 'deload';
  }): WeekPrescription[] {

    const { baseWeek, totalWeeks, phaseType } = params;
    const weeks: WeekPrescription[] = [];

    for (let week = 1; week <= totalWeeks; week++) {

      const days = baseWeek.map((day, index) => ({
        dayOrder: index + 1,
        exercises: day.map(exercise => ({
          exerciseId: exercise.id,
          sets: this.calculateSets(phaseType, week),
          reps: this.calculateReps(phaseType, week),
          restSeconds: this.calculateRest(phaseType),
        })),
      }));

      weeks.push({
        weekNumber: week,
        days,
      });
    }

    return weeks;
  }


  private calculateSets(
    phaseType: string,
    week: number,
  ): number {

    if (phaseType === 'base') {
      return 3 + Math.floor(week / 2);
    }

    if (phaseType === 'intensification') {
      return 4;
    }

    if (phaseType === 'peak') {
      return 5;
    }

    if (phaseType === 'deload') {
      return 2;
    }

    return 3;
  }

  private calculateReps(
    phaseType: string,
    week: number,
  ): number {

    if (phaseType === 'base') {
      return 12 - Math.floor(week / 2);
    }

    if (phaseType === 'intensification') {
      return 6;
    }

    if (phaseType === 'peak') {
      return 4;
    }

    if (phaseType === 'deload') {
      return 10;
    }

    return 8;
  }

  private calculateRest(
    phaseType: string,
  ): number {

    if (phaseType === 'peak') return 150;
    if (phaseType === 'intensification') return 120;
    if (phaseType === 'base') return 90;
    if (phaseType === 'deload') return 60;

    return 90;
  }
}
