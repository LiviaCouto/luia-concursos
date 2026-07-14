-- ============================================================
-- LUIA CONCURSOS — schema Supabase
-- Cole isso no SQL Editor do seu projeto Supabase e rode.
--
-- Abordagem: uma única linha guarda todo o estado do app como JSON
-- (sessions, reviews, assuntos, cronograma, config). Isso evita
-- reescrever toda a lógica do app em tabelas relacionais agora —
-- se um dia você quiser consultas mais ricas (ex: relatórios SQL
-- direto no banco), dá pra normalizar depois sem perder dados.
-- ============================================================

create table if not exists pcpe_state (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint somente_uma_linha check (id = 1)
);

-- garante que já existe a linha única antes do primeiro uso
insert into pcpe_state (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Segurança (RLS)
-- Este é um app pessoal, sem login — a "anon key" do Supabase
-- já é uma chave restrita (não é a service_role), mas qualquer
-- pessoa com a URL + anon key consegue ler/escrever nesta linha
-- se você deixar acesso público. Como é uso pessoal e o dado não
-- é sensível (progresso de estudo), a opção mais simples é abrir
-- select/update pra "anon". Se quiser mais segurança depois,
-- dá pra trocar por autenticação (login) e restringir por usuário.
-- ------------------------------------------------------------

alter table pcpe_state enable row level security;

create policy "permitir leitura anon" on pcpe_state
  for select using (true);

create policy "permitir atualização anon" on pcpe_state
  for update using (true);

create policy "permitir insert anon" on pcpe_state
  for insert with check (true);
