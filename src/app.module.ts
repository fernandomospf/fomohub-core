import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProfilesModule,
    WorkoutPlansModule,
  ],
})
export class AppModule {}
