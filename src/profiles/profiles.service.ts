import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfilesService {
  async findMe(req) {
    const { data, error } = await req.supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: created, error: createError } = await req.supabase
        .from('profiles')
        .insert({
          id: req.user.id,
          email: req.user.email,
        })
        .select()
        .single();

      if (createError) throw createError;
      return created;
    }

    return data;
  }
}