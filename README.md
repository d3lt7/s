# RC DEV: site institucional

Site estático (HTML, CSS e JavaScript puros), sem etapa de build.

```
index.html   estrutura e conteúdo
styles.css   estilos (tema claro e escuro)
script.js    interações e CONFIG de contato
assets/      mascote, logo, favicon e imagem de compartilhamento
vercel.json  cabeçalhos de segurança e cache
```

## Antes de publicar
1. Abra `script.js` e preencha `CONFIG` no topo (e-mail, WhatsApp com DDD e Instagram). Campos vazios somem do footer e o formulário fica em modo demonstração.
2. Com o domínio definido, troque em `index.html` o `og:image` por uma URL absoluta, por exemplo `https://seudominio.com.br/assets/og.png`. Redes sociais exigem URL completa.
3. Revise os textos de serviços, stack e perguntas frequentes.

## Testar localmente
```bash
npx serve .
```
Abra o endereço mostrado no terminal.

## Deploy na Vercel
**Pelo GitHub (recomendado)**
1. Crie um repositório e envie esta pasta (`git init`, `git add .`, `git commit`, `git push`).
2. Em vercel.com/new, importe o repositório.
3. Framework Preset: **Other**. Deixe Build Command e Output Directory vazios. Clique em **Deploy**.

**Pelo terminal**
```bash
npm i -g vercel
cd rcdev-site
vercel          # preview
vercel --prod   # produção
```

Para usar um domínio próprio: Project Settings > Domains.
