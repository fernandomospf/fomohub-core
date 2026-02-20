import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  async createEvent(req: any, dto: CreateEventDto) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: userId,
        title: dto.title,
        description: dto.description ?? null,
        category: dto.category ?? null,
        image_url: dto.image_url ?? null,
        event_date: dto.event_date,
        location: dto.location ?? null,
        max_participants: dto.max_participants ?? null,
        is_free: dto.is_free,
        price: dto.is_free ? 0 : (dto.price ?? 0),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async listEvents(req: any) {
    const supabase = req.supabase;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async getEventById(req: any, id: string) {
    const supabase = req.supabase;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .gte('event_date', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException('Evento não encontrado ou encerrado');
    return data;
  }

  async updateEvent(req: any, id: string, dto: UpdateEventDto) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data: existing, error: fetchError } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundException('Evento não encontrado');
    if (existing.user_id !== userId) {
      throw new ForbiddenException('Apenas o criador pode editar este evento');
    }

    const payload: Record<string, any> = {
      ...dto,
      updated_at: new Date().toISOString(),
    };

    if (dto.is_free === true) {
      payload.price = 0;
    }

    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(req: any, id: string) {
    const supabase = req.supabase;
    const userId = req.user.id;

    const { data: existing, error: fetchError } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundException('Evento não encontrado');
    if (existing.user_id !== userId) {
      throw new ForbiddenException('Apenas o criador pode remover este evento');
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
}
