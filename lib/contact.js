import { createHash } from 'node:crypto';
import { renderAutoReply } from './email.js';

const TYPES = ['Site ou landing page', 'Sistema web', 'API ou integração', 'Otimizar o que já existe', 'Ainda não sei'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export function validate(b) {
  const v = (k) => (typeof b?.[k] === 'string' ? b[k].trim() : '');
  const d = { name: v('name').replace(/\s+/g, ' '), email: v('email').toLowerCase(), type: v('type'), message: v('message') };
  const ok = d.name && d.name.length <= 80 && EMAIL_RE.test(d.email) && d.email.length <= 120 && TYPES.includes(d.type) && d.message && d.message.length <= 2000;
  return ok ? d : null;
}

export function createContactHandler({ getSql, sendEmail, env = process.env }) {
  return async function POST(request) {
    let body;
    try { body = await request.json(); } catch { return json({ error: 'Pedido inválido.' }, 400); }
    if (body?.website) return json({ ok: true }); // honeypot: bots recebem "sucesso" e nada é gravado

    const data = validate(body);
    if (!data) return json({ error: 'Confira os campos e tente de novo.' }, 400);

    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'desconhecido';
    const ipHash = createHash('sha256').update(ip + (env.IP_SALT || '')).digest('hex');

    try {
      const sql = getSql();
      const [lim] = await sql`
        SELECT count(*) FILTER (WHERE ip_hash = ${ipHash} AND created_at > now() - interval '1 hour')::int AS por_ip,
               count(*) FILTER (WHERE email = ${data.email})::int AS por_email
        FROM contacts WHERE created_at > now() - interval '1 day'`;
      if (lim.por_ip >= 5 || lim.por_email >= 2) return json({ error: 'Muitas tentativas. Aguarde um pouco e tente de novo.' }, 429);

      const [{ id }] = await sql`
        INSERT INTO contacts (name, email, project_type, message, ip_hash, user_agent)
        VALUES (${data.name}, ${data.email}, ${data.type}, ${data.message}, ${ipHash}, ${(request.headers.get('user-agent') || '').slice(0, 300)})
        RETURNING id`;

      const jobs = [sendEmail({ to: data.email, replyTo: env.MAIL_REPLY_TO, ...renderAutoReply(data) })];
      if (env.NOTIFY_EMAIL) {
        jobs.push(sendEmail({ to: env.NOTIFY_EMAIL, replyTo: data.email, subject: `Novo contato: ${data.name}`, text: `${data.name} <${data.email}>\nProjeto: ${data.type}\n\n${data.message}\n` }));
      }
      const [auto, notify] = await Promise.allSettled(jobs);
      if (notify?.status === 'rejected') console.error('aviso ao dono falhou', notify.reason);
      if (auto.status === 'fulfilled') {
        await sql`UPDATE contacts SET autoreply_sent_at = now() WHERE id = ${id}`;
      } else {
        console.error('autoresposta falhou', auto.reason);
        await sql`UPDATE contacts SET autoreply_error = ${String(auto.reason?.message ?? auto.reason).slice(0, 300)} WHERE id = ${id}`;
      }
      return json({ ok: true }); // o contato já está salvo, mesmo que o e-mail falhe
    } catch (err) {
      console.error('contato falhou', err);
      return json({ error: 'Não foi possível enviar agora. Tente novamente em instantes.' }, 500);
    }
  };
}
