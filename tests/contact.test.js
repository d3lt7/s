import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactHandler, validate } from '../lib/contact.js';
import { renderAutoReply, sendEmail } from '../lib/email.js';

const req = (body, headers = {}) => new Request('http://x/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
const ok = { name: 'Ana Souza', email: 'ANA@exemplo.com', type: 'Sistema web', message: 'Preciso de um sistema.' };

function setup({ lim = { por_ip: 0, por_email: 0 }, fail = false } = {}) {
  const queries = [], mails = [];
  const sql = async (s) => { const q = s.join('?'); queries.push(q); return /count\(/.test(q) ? [lim] : /INSERT/.test(q) ? [{ id: 7 }] : []; };
  const sendEmail = async (m) => { mails.push(m); if (fail && m.to === 'ana@exemplo.com') throw new Error('boom'); return { id: 'x' }; };
  const handler = createContactHandler({ getSql: () => sql, sendEmail, env: { NOTIFY_EMAIL: 'dono@x.com', MAIL_REPLY_TO: 'dono@x.com' } });
  return { handler, queries, mails };
}

test('salva o contato e envia a autoresposta para quem preencheu', async () => {
  const { handler, queries, mails } = setup();
  const res = await handler(req(ok));
  assert.equal(res.status, 200);
  assert.ok(queries.some((q) => /INSERT INTO contacts/.test(q)) && queries.some((q) => /autoreply_sent_at/.test(q)));
  assert.equal(mails[0].to, 'ana@exemplo.com');
  assert.match(mails[0].subject, /Ana/);
  assert.equal(mails[1].to, 'dono@x.com');
});

test('rejeita dados inválidos sem tocar no banco', async () => {
  const { handler, queries } = setup();
  assert.equal((await handler(req({ ...ok, email: 'x' }))).status, 400);
  assert.equal((await handler(req({ ...ok, type: 'outro' }))).status, 400);
  assert.equal(queries.length, 0);
});

test('honeypot preenchido finge sucesso e não grava', async () => {
  const { handler, queries, mails } = setup();
  assert.equal((await handler(req({ ...ok, website: 'spam' }))).status, 200);
  assert.equal(queries.length + mails.length, 0);
});

test('limite de envios devolve 429', async () => {
  const { handler, mails } = setup({ lim: { por_ip: 5, por_email: 0 } });
  assert.equal((await handler(req(ok))).status, 429);
  assert.equal(mails.length, 0);
});

test('se o e-mail falhar, o contato continua salvo e o erro é registrado', async () => {
  const { handler, queries } = setup({ fail: true });
  assert.equal((await handler(req(ok))).status, 200);
  assert.ok(queries.some((q) => /autoreply_error/.test(q)));
});

test('o HTML do e-mail escapa o nome digitado', () => {
  const { html } = renderAutoReply({ name: '<b>Ana</b>', type: 'Sistema web' });
  assert.ok(!html.includes('<b>Ana</b>') && html.includes('&lt;b&gt;Ana'));
});

test('sendEmail chama a API do Resend com o formato esperado', async () => {
  let call;
  globalThis.fetch = async (url, init) => { call = { url, init }; return new Response('{"id":"1"}', { status: 200 }); };
  await sendEmail({ to: 'a@b.com', subject: 'Oi', text: 'Oi', replyTo: 'r@b.com' }, { RESEND_API_KEY: 'k', MAIL_FROM: 'RC DEV <c@d.com>' });
  const b = JSON.parse(call.init.body);
  assert.equal(call.url, 'https://api.resend.com/emails');
  assert.equal(call.init.headers.Authorization, 'Bearer k');
  assert.deepEqual([b.from, b.to, b.reply_to], ['RC DEV <c@d.com>', ['a@b.com'], 'r@b.com']);
});

test('validate normaliza e-mail e nome', () => {
  assert.deepEqual(validate({ ...ok, name: '  Ana   Souza ' }), { ...ok, name: 'Ana Souza', email: 'ana@exemplo.com' });
});
