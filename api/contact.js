import { neon } from '@neondatabase/serverless';
import { createContactHandler } from '../lib/contact.js';
import { sendEmail } from '../lib/email.js';

// Vercel Function: POST /api/contact (outros métodos recebem 405 automaticamente)
export const POST = createContactHandler({ getSql: () => neon(process.env.DATABASE_URL), sendEmail });
