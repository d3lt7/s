import { assunto, mensagem, assinatura } from '../emails/autoresposta.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderAutoReply({ name, type }) {
  const d = { nome: name, primeiroNome: name.split(/\s+/)[0], tipo: type };
  const paras = mensagem(d);
  const text = `${paras.join('\n\n')}\n\n${assinatura.join('\n')}\n`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f2f6fb;font-family:Arial,Helvetica,sans-serif;color:#0b1320">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-top:6px solid #008CFF">
<tr><td style="padding:28px 28px 4px;font-size:20px;font-weight:700;letter-spacing:1px">RC DEV</td></tr>
<tr><td style="padding:12px 28px 28px;font-size:16px;line-height:1.6">${paras.map((p) => `<p style="margin:0 0 16px">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}<p style="margin:24px 0 0">${assinatura.map(esc).join('<br>')}</p></td></tr>
</table></td></tr></table></body></html>`;
  return { subject: assunto(d).replace(/[\r\n]+/g, ' '), text, html };
}

export async function sendEmail({ to, subject, text, html, replyTo }, env = process.env) {
  const { RESEND_API_KEY, MAIL_FROM } = env;
  if (!RESEND_API_KEY || !MAIL_FROM) throw new Error('RESEND_API_KEY ou MAIL_FROM não configurados');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, text, ...(html && { html }), ...(replyTo && { reply_to: replyTo }) }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}
