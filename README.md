# Luia Concursos

App pessoal de estudo pra PC-PE (Agente de Polícia), com revisão espaçada,
cronograma, edital estruturado e dashboard de progresso.

## Passo a passo pra colocar no ar

### 1. Criar o projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um projeto novo (grátis).
2. No **SQL Editor**, cole e rode o conteúdo de `supabase-schema.sql`.
3. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key** (não é a `service_role`, essa nunca compartilhe)

### 2. Configurar o app
Abra `js/supabase-client.js` e preencha:
```js
const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "sua-anon-key-aqui";
```

### 3. Subir pro GitHub
```bash
# dentro da pasta luia-liv
git remote add origin https://github.com/SEU_USUARIO/luia-concursos.git
git branch -M main
git push -u origin main
```

### 4. Ativar GitHub Pages
1. No repositório, vá em **Settings → Pages**.
2. Em "Source", selecione a branch `main` e a pasta `/ (root)`.
3. Salve — em alguns minutos o app estará em `https://SEU_USUARIO.github.io/luia-concursos/`.

## Estrutura de arquivos
```
luia-liv/
├── index.html               ← estrutura das abas
├── supabase-schema.sql      ← SQL pra rodar no Supabase (uma vez só)
├── css/style.css            ← design system "Escrivaninha"
└── js/
    ├── data.js              ← edital, grupos, cronograma padrão
    ├── app.js                ← toda a lógica das telas
    ├── supabase-client.js   ← conexão com o banco (preencher URL/key)
    └── init.js               ← inicialização (carrega por último)
```

## Nota de segurança
A tabela usa uma política de RLS aberta (qualquer um com a URL + anon key
pode ler/escrever). Pra um app pessoal sem dado sensível, isso é aceitável.
Se um dia quiser mais segurança, dá pra adicionar login (Supabase Auth) e
restringir a política por usuário.
