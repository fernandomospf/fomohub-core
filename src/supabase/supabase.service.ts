import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { AuthenticateRequest } from 'reqGuard';
import { SupabaseClient } from '@supabase/supabase-js';


@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  constructor(@Inject(REQUEST) private readonly request: AuthenticateRequest) {}

  get client(): SupabaseClient {
    return this.request.supabase;
  }
}
