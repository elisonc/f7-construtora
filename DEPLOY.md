# Colocar no ar 24 horas (sem depender do seu computador)

O site precisa de um servidor com **disco que não apaga** (guarda o banco e os documentos dos clientes).
Hospedagens simples que servem: **Render** (já deixei pronto, `render.yaml`), Railway ou uma VPS (Hostinger, Contabo).

## Render (o mais simples)

1. Crie uma conta em https://render.com (cartão necessário; plano Starter, cerca de US$ 7/mês + disco de 2 GB).
2. Suba esta pasta para um repositório **privado** no GitHub (GitHub Desktop: *Add local repository* → *Publish repository*, marque *Keep this code private*).
3. No Render: **New → Blueprint** → escolha o repositório. Ele lê o `render.yaml`.
4. Quando pedir `F7_SENHA_GESTOR`, digite uma senha forte para o painel do gestor.
5. Aguarde o build (uns 5 minutos). O endereço sai como `https://f7-engenharia-estrategica.onrender.com`.
6. Na primeira subida, o site cria o gestor e carrega as 31 obras e as fotos sozinho.

## Quando comprar o domínio (www.f7engenhariaestrategica.com.br)

No Render: *Settings → Custom Domains → Add* e siga os dois registros DNS que ele mostrar no Registro.br.
O HTTPS é automático.

## Importante

- Nunca suba as pastas `data/`, `storage/` e `producao/` (já estão no `.gitignore`).
- Faça backup do disco (`/data`) de tempos em tempos: Render *Disks → Snapshots*.
