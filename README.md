# RC DEV: site institucional

Site estático (HTML, CSS e JavaScript) com uma função serverless na Vercel que grava os contatos no **Neon** (Postgres) e envia um **e-mail automático escrito por você** para quem preencheu o formulário, via **Resend**.

```
index.html  styles.css  script.js   site
assets/                              mascote, logo, favicon, imagem de compartilhamento
api/contact.js                       POST /api/contact (Vercel Function)
lib/                                 validação, limite de envios, banco e envio de e-mail
emails/autoresposta.js               TEXTO DO E-MAIL (edite aqui)
db/schema.sql                        tabela do Neon
tests/                               npm test
```

## Como funciona
Formulário > `/api/contact` > valida os campos > confere limite de envios (5 por hora por IP, 2 por dia por e-mail) > grava no Neon > envia a autoresposta ao visitante (e um aviso para você, se `NOTIFY_EMAIL` existir). Se o e-mail falhar, o contato continua salvo e o erro fica na coluna `autoreply_error`. Bots que preenchem o campo escondido são ignorados.

## Configuração (uma vez)
1. **Neon:** crie um projeto em neon.com, abra o **SQL Editor**, cole o conteúdo de `db/schema.sql` e rode. Em **Connect**, copie a connection string (pooled) para `DATABASE_URL`.
2. **Resend:** crie conta em resend.com, adicione o seu domínio em **Domains** e crie os registros DNS que ele pedir (SPF e DKIM). Depois de verificado, crie uma **API Key**. Sem domínio verificado só é possível testar enviando para o e-mail da sua própria conta, usando `onboarding@resend.dev` como remetente.
3. **Variáveis na Vercel:** em Project Settings > Environment Variables, crie as variáveis de `.env.example` (`DATABASE_URL`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_REPLY_TO`, e opcionais `NOTIFY_EMAIL` e `IP_SALT`) e faça um novo deploy.
4. **Seu texto:** edite `emails/autoresposta.js` com o assunto e a mensagem que você quer enviar.
5. `script.js`: preencha `CONFIG` com e-mail, WhatsApp e Instagram (footer). No `index.html`, troque o `og:image` por uma URL absoluta.

## Testar localmente
```bash
npm install
npm test                      # testes da API
npm i -g vercel && vercel link
vercel env pull .env.local    # baixa as variáveis
vercel dev                    # site + /api/contact em http://localhost:3000
```
`npx serve` não executa a pasta `api/`; use `vercel dev`.

## Ver os contatos
No SQL Editor do Neon:
```sql
SELECT id, created_at, name, email, project_type, message, autoreply_sent_at, autoreply_error
FROM contacts ORDER BY created_at DESC;
```

## Deploy
Envie a pasta para o GitHub e importe em vercel.com/new (preset **Other**, sem build command), ou rode `vercel --prod`.

## Privacidade (LGPD)
O site guarda nome, e-mail e mensagem, e apenas o hash do IP. Publique uma política de privacidade e defina por quanto tempo vai manter esses dados.
