// EDITE AQUI o e-mail que cada pessoa recebe ao preencher o formulário.
// Variáveis: d.nome, d.primeiroNome e d.tipo (o tipo de projeto escolhido).
// Cada item de "mensagem" vira um parágrafo. Use \n para quebra de linha dentro do parágrafo.

export const assunto = (d) => `Recebi sua mensagem, ${d.primeiroNome}!`;

export const mensagem = (d) => [
  `Olá, ${d.primeiroNome}!`,
  `Obrigado por entrar em contato com a RC DEV. Recebi o seu pedido sobre "${d.tipo}" e vou analisar com atenção.`,
  `Em breve eu respondo pessoalmente com os próximos passos. Se quiser acrescentar algum detalhe, é só responder este e-mail.`,
];

export const assinatura = ['Um abraço,', 'Renan', 'RC DEV'];
