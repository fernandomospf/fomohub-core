import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { AiModule } from './ai/ai.module';
import { WorkoutBuilderModule } from './workout-builder/workout-builder.module';
import { ProgressionEngineModule } from './progression-engine/progression-engine.module';
import { ExerciseLibraryModule } from './exercise-library/exercise-library.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ProgramGeneratorModule } from './program-generator/program-generator.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProfilesModule,
    WorkoutPlansModule,
    AiModule,
    WorkoutBuilderModule,
    ProgressionEngineModule,
    ExerciseLibraryModule,
    SupabaseModule,
    ProgramGeneratorModule,
    EventsModule,
  ],
})

export class AppModule {}
