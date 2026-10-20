# F7 Construtora

Site completo: site público, área do cliente e painel do gestor. React + GSAP + Vanta (stack padrão), backend em Node sem frameworks, com banco SQLite embutido (`node:sqlite`).

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5196. Na primeira execução, o banco é criado com dados de exemplo. As credenciais de teste do gestor e do cliente estão no topo de `server/seed.js`.

- `npm run seed`: apaga tudo e recria os dados de exemplo.
- `npm run build` e depois `npm start`: modo produção (serve `dist/`, ativa CSP).

## O que tem

| Área | Endereço | O que faz |
|---|---|---|
| Site | `/` | Hero com abertura animada, sobre, números, empreendimentos com filtro, processo, vitrine da área do cliente, diferenciais e contato |
| Empreendimento | `/empreendimentos/:slug` | Ficha, descrição e formulário "Tenho interesse" |
| Login | `/entrar` | Mesmo login para cliente e gestor |
| Área do cliente | `/minha-conta` | Progresso da obra, etapas, fotos (com galeria), documentos para baixar, contato e troca de senha |
| Painel do gestor | `/gestor` | Dashboard de acessos e clientes, cadastro de clientes, obras (etapas, fotos e documentos), empreendimentos e contatos |

## Antes de publicar

1. Preencha `src/config.js` com telefone, WhatsApp, e-mail, endereço e os números reais (hoje são de exemplo).
2. Revise os textos institucionais (sobre, diferenciais, processo) e a página `/privacidade` com o jurídico.
3. Em produção, defina `F7_EMAIL_GESTOR` e `F7_SENHA_GESTOR` antes do primeiro `npm start`. Sem `F7_SENHA_GESTOR`, a senha é gerada e aparece uma vez no console. Em produção não entram dados de exemplo.
4. Publique atrás de HTTPS (o cookie de sessão é `Secure` em produção). Se houver proxy reverso, use `CONFIAR_PROXY=1` para ler o IP real.
5. Faça backup de `data/` (banco) e `storage/` (fotos e documentos dos clientes).

## Segurança

- Senhas com scrypt. A sessão fica em cookie `HttpOnly` + `SameSite=Lax`, e o banco guarda só o hash do token.
- Toda escrita exige o cabeçalho `X-F7` e a mesma origem (proteção CSRF).
- O servidor confere quem é o dono de cada foto e documento. O documento de outro cliente responde 404.
- Arquivos ficam em `storage/`, fora de qualquer pasta pública. O tipo é conferido pelos bytes, não pela extensão.
- Login bloqueia após 8 erros em 15 minutos (por IP e por e-mail). O formulário de contato tem limite de envios e campo-isca contra robôs.
- As métricas de acesso não usam cookie: o visitante vira um código que muda todo dia.

## Animações

GSAP (SplitText, ScrollTrigger), Vanta Fog no hero (o único WebGL da página) e efeitos no estilo React Bits feitos com GSAP (spotlight, botão magnético, contador). Tudo respeita "reduzir movimento" do sistema.

Se o Windows estiver com **Efeitos de animação** desligados (Configurações › Acessibilidade › Efeitos visuais), o site aparece sem animação, de propósito. Para revisar as animações em desenvolvimento, abra com `?animacoes=1`.
