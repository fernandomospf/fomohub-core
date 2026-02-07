import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient } from '../config/supabase.client';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token ausente');
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new InternalServerErrorException(
        'Supabase URL or Key is missing in environment configuration',
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createSupabaseClient(token, supabaseUrl, supabaseKey);

    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      throw new UnauthorizedException('Token inválido');
    }

    request.user = data.user;
    request.supabase = supabase;
    return true;
  }
}
