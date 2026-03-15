import { createClient } from '@insforge/sdk';
import { INSFORGE_BASE_URL, INSFORGE_ANON_KEY } from '../config';

export const insforge = createClient({
  baseUrl: INSFORGE_BASE_URL,
  anonKey: INSFORGE_ANON_KEY
});
