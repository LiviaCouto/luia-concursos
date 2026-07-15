/* ============================================================
   LUIA CONCURSOS — lógica principal
   Depende de data.js (EDITAL_AGENTE, GRUPOS, STAGES, CRONOGRAMA_PADRAO)
   ============================================================ */

const STORAGE_KEY = "luialiv-data";
const MIN_QUESTOES_PONTO_FRACO = 3;
const MIN_QUESTOES_DIA_ATIVO = 10;
const MESES_ABREV = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESES_NOMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA_ABREV = ["D","S","T","Q","Q","S","S"];

const ICONS = {
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13z"/></svg>`,
  flag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 21V4M5 4h13l-3 4 3 4H5"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v13m0 0l-4-4m4 4l4-4M4 20h16"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20V7m0 0l-4 4m4-4l4 4M4 4h16"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`
};

let DATA = {
  tema: "light",
  assuntos: {},
  cronograma: {},
  sessions: [],
  reviews: [],
  config: { dataProva: "", metaDiaria: 80 },
  acesso: null,
  perfil: { apelido: "" }
};

let sessaoEditandoId = null;
let disciplinaAberta = null;
let buscaEdital = "";
let filtroEvolucao = "";
let heatmapAno = new Date().getFullYear();
let heatmapMes = new Date().getMonth(); // 0-indexado

// ---------- Utilitários de data ----------
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function diffDias(dateStrAlvo, dateStrBase) {
  const a = new Date(dateStrAlvo + "T00:00:00");
  const b = new Date(dateStrBase + "T00:00:00");
  return Math.round((a - b) / 86400000);
}
function fmtDate(dateStr) {
  const [y,m,d] = dateStr.split("-");
  return `${d}/${m}`;
}
function fmtDateFull(dateStr) {
  const [y,m,d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
function nomeDiaSemana(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return DIAS_SEMANA[d.getDay()];
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function assuntoKey(disciplina, assunto) {
  return disciplina + "|||" + assunto;
}
function totalQuestoesPorDia(data) {
  return DATA.sessions.filter(s => s.data === data).reduce((s,x) => s + x.acertos + x.erros, 0);
}
function diaEstaAtivo(data) {
  return totalQuestoesPorDia(data) >= MIN_QUESTOES_DIA_ATIVO;
}
function isoWeek(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  const week = 1 + Math.ceil((firstThursday - target) / (7 * 86400000));
  return `${d.getFullYear()}-S${String(week).padStart(2,'0')}`;
}

// ---------- Persistência ----------
// loadData() e saveData() agora vivem em js/supabase-client.js —
// esse arquivo só declara DATA; quem carrega e salva é o cliente Supabase.

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- Tema ----------
function aplicarTema() {
  document.documentElement.setAttribute("data-theme", DATA.tema);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.innerHTML = DATA.tema === "dark" ? ICONS.sun : ICONS.moon;
}

// ---------- Assunto: status e notas ----------
function getAssuntoState(disciplina, assunto) {
  const key = assuntoKey(disciplina, assunto);
  return DATA.assuntos[key] || { status: "nao_iniciado", nota: "" };
}
function setAssuntoState(disciplina, assunto, patch) {
  const key = assuntoKey(disciplina, assunto);
  const atual = getAssuntoState(disciplina, assunto);
  DATA.assuntos[key] = Object.assign({}, atual, patch);
}
function contarAssuntosTotais() {
  return EDITAL_AGENTE.reduce((s, d) => s + d.assuntos.length, 0);
}
function contarAssuntosDominados() {
  let count = 0;
  EDITAL_AGENTE.forEach(d => d.assuntos.forEach(a => {
    if (getAssuntoState(d.disciplina, a).status === "dominado") count++;
  }));
  return count;
}
function contarAssuntosIniciados() {
  let count = 0;
  EDITAL_AGENTE.forEach(d => d.assuntos.forEach(a => {
    if (getAssuntoState(d.disciplina, a).status !== "nao_iniciado") count++;
  }));
  return count;
}

// ---------- Streak ----------
function calcularStreak() {
  const datas = [...new Set(DATA.sessions.map(s => s.data))]
    .filter(d => diaEstaAtivo(d))
    .sort().reverse();
  if (datas.length === 0) return 0;
  let streak = 0;
  let cursor = todayLocal();
  if (datas[0] !== cursor) cursor = addDays(cursor, -1);
  for (const d of datas) {
    if (d === cursor) { streak++; cursor = addDays(cursor, -1); }
    else if (d < cursor) break;
  }
  return streak;
}

// ---------- Tabs ----------
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    ["hoje","registrar","progresso","edital","cronograma","config"].forEach(id => {
      document.getElementById("tab-" + id).style.display = (id === tab.dataset.tab) ? "block" : "none";
    });
    render();
  });
});

document.getElementById("theme-toggle").addEventListener("click", async () => {
  DATA.tema = DATA.tema === "dark" ? "light" : "dark";
  aplicarTema();
  await saveData();
});

// ============================================================
// WIDGET: Meu desempenho — últimos 7 dias (gauge + mini evolução)
// ============================================================
function criarGaugeArc(pct) {
  const cx = 100, cy = 100, r = 80;
  const anguloGraus = 180 - (pct / 100) * 180;
  const anguloRad = anguloGraus * Math.PI / 180;
  const mx = cx + r * Math.cos(anguloRad);
  const my = cy - r * Math.sin(anguloRad);
  const c = Math.PI * r; // meio perímetro
  const offset = c - (pct / 100) * c;

  return `
    <svg viewBox="0 0 200 110" class="gauge-svg">
      <path d="M 20 100 A 80 80 0 0 1 180 100" class="gauge-bg"/>
      <path d="M 20 100 A 80 80 0 0 1 180 100" class="gauge-fill" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
      <circle cx="${mx}" cy="${my}" r="7" class="gauge-marcador"/>
    </svg>
  `;
}

function renderMiniEvolucao(dias) {
  const w = 400, h = 90, padX = 20, padY = 14;
  const max = Math.max(1, ...dias.map(d => d.total));
  const stepX = dias.length > 1 ? (w - padX*2) / (dias.length - 1) : 0;
  const coords = dias.map((d, i) => {
    const x = padX + i*stepX;
    const y = h - padY - (d.total / max) * (h - padY*2);
    return [x, y];
  });
  const linha = coords.map(c => c.join(",")).join(" ");
  const circulos = coords.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="3.5" class="chart-ponto"/>`).join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" class="chart-svg" style="height:100px">
      <line x1="${padX}" y1="${h-padY}" x2="${w-padX}" y2="${h-padY}" class="chart-eixo"/>
      <polyline points="${linha}" class="chart-linha"/>
      ${circulos}
    </svg>
    <div class="mini-evolucao-titulo">Evolução · últimos 7 dias</div>
  `;
}

function renderDesempenho7Dias() {
  const today = todayLocal();
  const inicio = addDays(today, -6);
  const sessoes7d = DATA.sessions.filter(s => s.data >= inicio && s.data <= today);

  const acertos = sessoes7d.reduce((s,x) => s + x.acertos, 0);
  const erros = sessoes7d.reduce((s,x) => s + x.erros, 0);
  const total = acertos + erros;
  const pct = total > 0 ? (acertos / total * 100) : 0;

  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const doDia = DATA.sessions.filter(s => s.data === d);
    dias.push({
      data: d,
      total: doDia.reduce((s,x) => s + x.acertos + x.erros, 0)
    });
  }

  return `
    <div class="card">
      <h3>${ICONS.target} Meu desempenho · últimos 7 dias</h3>
      <div class="gauge-wrap">
        ${criarGaugeArc(pct)}
        <div class="gauge-label">
          <span class="pct">${pct.toFixed(2)}%</span>
          <span class="rotulo">Aproveitamento</span>
        </div>
      </div>
      <div class="stat-row-3">
        <div class="stat-mini">
          <div class="icone">${ICONS.book}</div>
          <div class="num">${total}</div>
          <div class="label">Resoluções</div>
        </div>
        <div class="stat-mini ok">
          <div class="icone">${ICONS.check}</div>
          <div class="num">${acertos}</div>
          <div class="label">Acertos</div>
        </div>
        <div class="stat-mini fail">
          <div class="icone">${ICONS.x}</div>
          <div class="num">${erros}</div>
          <div class="label">Erros</div>
        </div>
      </div>
      ${renderMiniEvolucao(dias)}
    </div>
  `;
}

// ============================================================
// PAINEL GRÁFICO (Hoje)
// ============================================================
function criarAnelProgresso(pct) {
  const r = 42, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return `
    <svg viewBox="0 0 100 100" class="anel-svg">
      <circle cx="50" cy="50" r="${r}" class="anel-bg"/>
      <circle cx="50" cy="50" r="${r}" class="anel-fill" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
      <text x="50" y="56" text-anchor="middle" class="anel-texto">${pct}%</text>
    </svg>
  `;
}

function renderPainel() {
  const totalAssuntos = contarAssuntosTotais();
  const dominados = contarAssuntosDominados();
  const pctEdital = totalAssuntos > 0 ? Math.round((dominados / totalAssuntos) * 100) : 0;

  const gruposStats = { A: { acertos: 0, total: 0 }, B: { acertos: 0, total: 0 }, C: { acertos: 0, total: 0 } };
  DATA.sessions.forEach(s => {
    const g = GRUPOS[s.disciplina] || "C";
    gruposStats[g].acertos += s.acertos;
    gruposStats[g].total += s.acertos + s.erros;
  });

  const barras = ["A", "B", "C"].map(g => {
    const st = gruposStats[g];
    const pct = st.total > 0 ? Math.round((st.acertos / st.total) * 100) : 0;
    return `
      <div class="barra-grupo">
        <div class="barra-grupo-label"><span>Grupo ${g}</span><span>${st.total > 0 ? pct + "%" : "sem dados"}</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill grupo-${g}-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join("");

  return `
    <div class="card painel-grafico">
      <div class="painel-anel">
        ${criarAnelProgresso(pctEdital)}
        <div class="painel-anel-label">Edital dominado</div>
      </div>
      <div class="painel-barras">
        ${barras}
      </div>
    </div>
  `;
}

// ============================================================
// ABA: HOJE
// ============================================================
function renderHoje() {
  const el = document.getElementById("tab-hoje");
  const today = todayLocal();
  const diaHoje = nomeDiaSemana(today);
  const disciplinasHoje = DATA.cronograma[diaHoje] || [];

  const pending = DATA.reviews.filter(r => !r.done && r.dueDate <= today)
    .sort((a,b) => a.dueDate.localeCompare(b.dueDate));

  const totalA = DATA.sessions.reduce((s, x) => s + x.acertos, 0);
  const totalE = DATA.sessions.reduce((s, x) => s + x.erros, 0);
  const totalQ = totalA + totalE;
  const pct = totalQ > 0 ? Math.round((totalA/totalQ)*100) : 0;
  const streak = calcularStreak();

  const questoesHoje = DATA.sessions.filter(s => s.data === today).reduce((s,x) => s + x.acertos + x.erros, 0);
  const meta = DATA.config.metaDiaria || 80;
  const pctMeta = Math.min(100, Math.round((questoesHoje / meta) * 100));

  let diasRestantesHtml = "";
  if (DATA.config.dataProva) {
    const dias = diffDias(DATA.config.dataProva, today);
    diasRestantesHtml = `<div class="stat"><div class="num">${dias >= 0 ? dias : 0}</div><div class="label">dias até a prova</div></div>`;
  }

  let html = renderDesempenho7Dias() + `<div class="grid-2col">${renderHeatmap()}${renderPainel()}</div>` + `
    <div class="card">
      <div class="stat-row">
        <div class="stat"><div class="num">${streak}</div><div class="label">dias seguidos</div></div>
        <div class="stat"><div class="num">${pending.length}</div><div class="label">revisões pendentes</div></div>
        <div class="stat"><div class="num ok">${totalA}</div><div class="label">questões certas</div></div>
        <div class="stat"><div class="num fail">${totalE}</div><div class="label">questões erradas</div></div>
        <div class="stat"><div class="num">${pct}%</div><div class="label">acerto geral</div></div>
        ${diasRestantesHtml}
      </div>
    </div>

    <div class="card">
      <h3>${ICONS.target} Meta diária</h3>
      <div class="meta-diaria-linha">
        <span>${questoesHoje} de ${meta} questões hoje</span>
        <span class="valor">${pctMeta}%</span>
      </div>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pctMeta}%"></div></div>
    </div>

    <div class="card destaque-dia">
      <div class="dia-nome">${diaHoje}, hoje · ${fmtDateFull(today)}</div>
      <div>
        ${disciplinasHoje.length === 0
          ? '<span style="color:var(--text-dim);font-size:15px;">Nenhuma disciplina marcada pra hoje. Confira a aba Cronograma.</span>'
          : disciplinasHoje.map(d => {
              const grupo = GRUPOS[d] || null;
              const classe = grupo ? `grupo-${grupo}` : "";
              return `<span class="chip-disciplina ${classe}">${d}</span>`;
            }).join("")
        }
      </div>
    </div>

    <div class="card">
      <h3>${ICONS.calendar} Revisões de hoje</h3>
  `;

  if (pending.length === 0) {
    html += `<div class="empty">Nenhuma revisão pendente. Hora de avançar em assunto novo.</div>`;
  } else {
    pending.forEach(r => {
      const overdue = r.dueDate < today;
      html += `
        <div class="review-item">
          <div class="review-info">
            <div class="disc">${r.disciplina}</div>
            <div class="assunto">${r.assunto}</div>
            <span class="stage-badge ${overdue ? 'atrasada' : ''}">${overdue ? 'atrasada · ' : ''}${STAGES[r.stage].label}</span>
          </div>
          <div class="btn-group">
            <button class="btn-icon btn-ok" data-id="${r.id}" data-result="ok" title="Lembrei bem">${ICONS.check}</button>
            <button class="btn-icon btn-fail" data-id="${r.id}" data-result="fail" title="Esqueci">${ICONS.x}</button>
            <button class="btn-icon btn-excluir" data-id="${r.id}" data-result="del" title="Excluir revisão">${ICONS.trash}</button>
          </div>
        </div>
      `;
    });
  }
  html += `</div>`;
  el.innerHTML = html;

  const btnPrev = document.getElementById("heatmap-prev");
  const btnNext = document.getElementById("heatmap-next");
  if (btnPrev) btnPrev.addEventListener("click", () => mudarMesHeatmap(-1));
  if (btnNext) btnNext.addEventListener("click", () => mudarMesHeatmap(1));

  el.querySelectorAll("[data-result]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const result = btn.dataset.result;

      if (result === "del") {
        DATA.reviews = DATA.reviews.filter(r => r.id !== id);
        showToast("Revisão excluída.");
        await saveData();
        render();
        return;
      }

      const review = DATA.reviews.find(r => r.id === id);
      if (!review) return;
      review.done = true;

      const today2 = todayLocal();
      const nextStage = result === "ok" ? review.stage + 1 : Math.max(review.stage - 1, 0);

      if (nextStage < STAGES.length) {
        DATA.reviews.push({
          id: uid(), sessionId: review.sessionId, disciplina: review.disciplina, assunto: review.assunto,
          stage: nextStage, dueDate: addDays(today2, STAGES[nextStage].days), done: false
        });
        showToast(result === "ok"
          ? "Registrado. Próxima revisão em " + STAGES[nextStage].days + " dias."
          : "Sem problema — revisão reagendada.");
      } else {
        showToast("Assunto consolidado.");
      }
      await saveData();
      render();
    });
  });
}

// ============================================================
// ABA: REGISTRAR
// ============================================================
function renderRegistrar() {
  const el = document.getElementById("tab-registrar");
  const editando = sessaoEditandoId ? DATA.sessions.find(s => s.id === sessaoEditandoId) : null;

  el.innerHTML = `
    <div class="card">
      <h3>${ICONS.book} ${editando ? "Editar sessão" : "Registrar sessão de estudo"}</h3>
      ${editando ? `<div class="aviso-edicao"><span>Editando sessão de ${fmtDateFull(editando.data)}</span><button id="btn-cancelar-edicao">Cancelar</button></div>` : ""}
      <div class="row2">
        <div>
          <label>Data</label>
          <input id="in-data" type="date" value="${editando ? editando.data : todayLocal()}" />
        </div>
        <div>
          <label>Hora</label>
          <input id="in-hora" type="time" value="${editando ? editando.hora : nowTime()}" />
        </div>
      </div>
      <label>Disciplina</label>
      <select id="in-disciplina">
        ${EDITAL_AGENTE.map(d => `<option value="${d.disciplina}" ${editando && editando.disciplina === d.disciplina ? "selected" : ""}>${d.disciplina}</option>`).join("")}
      </select>
      <label>Assunto</label>
      <select id="in-assunto"></select>
      <div class="row2">
        <div>
          <label>Questões certas</label>
          <input id="in-acertos" type="number" min="0" value="${editando ? editando.acertos : ''}" placeholder="0" />
        </div>
        <div>
          <label>Questões erradas</label>
          <input id="in-erros" type="number" min="0" value="${editando ? editando.erros : ''}" placeholder="0" />
        </div>
      </div>
      <label>Anotações desta sessão</label>
      <textarea id="in-nota" placeholder="O que você percebeu nessa sessão — pegadinha, dúvida, artigo específico...">${editando ? (editando.nota || "") : ""}</textarea>
      <button class="btn-primary" id="btn-salvar">${editando ? "Atualizar sessão" : "Salvar sessão"}</button>
    </div>

    <div class="card">
      <h3>${ICONS.calendar} Histórico</h3>
      <div class="filtro-historico">
        <select id="filtro-disciplina">
          <option value="">Todas as disciplinas</option>
          ${EDITAL_AGENTE.map(d => `<option value="${d.disciplina}">${d.disciplina}</option>`).join("")}
        </select>
      </div>
      <div id="resumo-historico" class="resumo-quantitativo"></div>
      <div id="lista-historico"></div>
    </div>
  `;

  function popularAssuntos(preSelecionado) {
    const disc = document.getElementById("in-disciplina").value;
    const entry = EDITAL_AGENTE.find(d => d.disciplina === disc);
    const sel = document.getElementById("in-assunto");
    sel.innerHTML = (entry ? entry.assuntos : []).map(a =>
      `<option value="${a}" ${preSelecionado === a ? "selected" : ""}>${a}</option>`
    ).join("");
  }
  document.getElementById("in-disciplina").addEventListener("change", () => popularAssuntos());
  popularAssuntos(editando ? editando.assunto : null);

  if (editando) {
    document.getElementById("btn-cancelar-edicao").addEventListener("click", () => {
      sessaoEditandoId = null;
      renderRegistrar();
    });
  }

  document.getElementById("btn-salvar").addEventListener("click", async () => {
    const data = document.getElementById("in-data").value || todayLocal();
    const hora = document.getElementById("in-hora").value || nowTime();
    const disciplina = document.getElementById("in-disciplina").value;
    const assunto = document.getElementById("in-assunto").value;
    const acertos = parseInt(document.getElementById("in-acertos").value) || 0;
    const erros = parseInt(document.getElementById("in-erros").value) || 0;
    const nota = document.getElementById("in-nota").value.trim();

    if (acertos === 0 && erros === 0) { showToast("Registra pelo menos uma questão."); return; }

    if (sessaoEditandoId) {
      const s = DATA.sessions.find(s => s.id === sessaoEditandoId);
      Object.assign(s, { data, hora, disciplina, assunto, acertos, erros, nota });
      sessaoEditandoId = null;
      await saveData();
      showToast("Sessão atualizada.");
    } else {
      const sessionId = uid();
      DATA.sessions.push({ id: sessionId, data, hora, disciplina, assunto, acertos, erros, nota });
      DATA.reviews.push({
        id: uid(), sessionId, disciplina, assunto,
        stage: 0, dueDate: addDays(data, STAGES[0].days), done: false
      });
      const estado = getAssuntoState(disciplina, assunto);
      if (estado.status === "nao_iniciado") setAssuntoState(disciplina, assunto, { status: "estudando" });
      await saveData();
      showToast("Sessão salva — revisão marcada pra " + fmtDate(addDays(data, STAGES[0].days)));
    }
    render();
  });

  document.getElementById("filtro-disciplina").addEventListener("change", renderHistorico);
  renderHistorico();
}

function renderHistorico() {
  const filtro = document.getElementById("filtro-disciplina")?.value || "";
  const container = document.getElementById("lista-historico");
  const resumo = document.getElementById("resumo-historico");
  if (!container) return;

  const filtrados = DATA.sessions.filter(s => !filtro || s.disciplina === filtro);
  const totalA = filtrados.reduce((s,x) => s + x.acertos, 0);
  const totalE = filtrados.reduce((s,x) => s + x.erros, 0);
  if (resumo) resumo.innerHTML = `<span class="ok">${totalA} certas</span><span class="fail">${totalE} erradas</span><span>${filtrados.length} sessões</span>`;

  const lista = filtrados
    .sort((a,b) => (b.data + b.hora).localeCompare(a.data + a.hora))
    .slice(0, 40);

  if (lista.length === 0) {
    container.innerHTML = `<div class="empty">Nenhuma sessão registrada ainda.</div>`;
    return;
  }

  container.innerHTML = lista.map(s => `
    <div class="timeline-item">
      <div class="timeline-data">${fmtDate(s.data)}<br>${s.hora}</div>
      <div style="flex:1">
        <div class="timeline-conteudo">
          <div class="disc">${s.disciplina}</div>
          <div class="assunto">${s.assunto}</div>
        </div>
        <div class="timeline-resultado">
          <span class="acertos">${s.acertos} certas</span> · <span class="erros">${s.erros} erradas</span>
        </div>
        ${s.nota ? `<div class="timeline-nota">${s.nota}</div>` : ""}
      </div>
      <div class="timeline-acoes">
        <button class="btn-icon pequeno btn-editar" data-editar="${s.id}" title="Editar">${ICONS.edit}</button>
        <button class="btn-icon pequeno btn-excluir" data-excluir="${s.id}" title="Excluir">${ICONS.trash}</button>
      </div>
    </div>
  `).join("");

  container.querySelectorAll("[data-editar]").forEach(btn => {
    btn.addEventListener("click", () => {
      sessaoEditandoId = btn.dataset.editar;
      renderRegistrar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  container.querySelectorAll("[data-excluir]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.excluir;
      if (!confirm("Excluir esta sessão? As revisões associadas também serão removidas.")) return;
      DATA.sessions = DATA.sessions.filter(s => s.id !== id);
      DATA.reviews = DATA.reviews.filter(r => r.sessionId !== id);
      await saveData();
      showToast("Sessão excluída.");
      render();
    });
  });
}

// ============================================================
// ABA: PROGRESSO
// ============================================================
function computeAssuntoStats() {
  const map = {};
  DATA.sessions.forEach(s => {
    const key = assuntoKey(s.disciplina, s.assunto);
    if (!map[key]) map[key] = { disciplina: s.disciplina, assunto: s.assunto, acertos: 0, total: 0 };
    map[key].acertos += s.acertos;
    map[key].total += s.acertos + s.erros;
  });
  return Object.values(map).map(v => ({ ...v, pct: v.total > 0 ? Math.round((v.acertos/v.total)*100) : 0 }));
}

function renderPontosFracos() {
  const stats = computeAssuntoStats().filter(s => s.total >= MIN_QUESTOES_PONTO_FRACO);
  stats.sort((a,b) => a.pct - b.pct);
  const piores = stats.slice(0, 5);

  let html = `<div class="card"><h3>${ICONS.target} Pontos fracos</h3><div class="subtitle">mínimo ${MIN_QUESTOES_PONTO_FRACO} questões respondidas por assunto</div>`;
  if (piores.length === 0) {
    html += `<div class="empty">Ainda não há assuntos com questões suficientes pra apontar um ponto fraco confiável.</div>`;
  } else {
    piores.forEach((p, i) => {
      html += `
        <div class="ponto-fraco-item">
          <div class="ponto-fraco-rank">${i+1}º</div>
          <div class="ponto-fraco-info">
            <div class="disc">${p.disciplina}</div>
            <div class="assunto">${p.assunto}</div>
          </div>
          <div>
            <div class="ponto-fraco-pct">${p.pct}%</div>
            <div class="ponto-fraco-total">${p.total}q</div>
          </div>
        </div>
      `;
    });
  }
  html += `</div>`;
  return html;
}

function maxQuestoesDiaAtivoGlobal() {
  const datas = [...new Set(DATA.sessions.map(s => s.data))].filter(d => diaEstaAtivo(d));
  const contagens = datas.map(d => totalQuestoesPorDia(d));
  return Math.max(1, ...contagens);
}

function podeAvancarMesHeatmap() {
  const hoje = new Date();
  return (heatmapAno * 12 + heatmapMes) < (hoje.getFullYear() * 12 + hoje.getMonth());
}

function mudarMesHeatmap(delta) {
  let novoMes = heatmapMes + delta;
  let novoAno = heatmapAno;
  if (novoMes < 0) { novoMes = 11; novoAno--; }
  if (novoMes > 11) { novoMes = 0; novoAno++; }
  const hoje = new Date();
  if (novoAno * 12 + novoMes > hoje.getFullYear() * 12 + hoje.getMonth()) return;
  heatmapAno = novoAno;
  heatmapMes = novoMes;
  renderHoje();
}

function renderHeatmap() {
  const today = todayLocal();
  const max = maxQuestoesDiaAtivoGlobal();
  const isMesAtual = (heatmapAno === new Date().getFullYear() && heatmapMes === new Date().getMonth());

  const primeiroDiaSemana = new Date(heatmapAno, heatmapMes, 1).getDay();
  const numDias = new Date(heatmapAno, heatmapMes + 1, 0).getDate();

  let celulas = [];
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null);
  for (let dia = 1; dia <= numDias; dia++) {
    const data = `${heatmapAno}-${String(heatmapMes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
    celulas.push(data > today ? "futuro" : data);
  }
  while (celulas.length % 7 !== 0) celulas.push(null);

  const cabecalhoDias = DIAS_SEMANA_ABREV.map(d => `<div class="heatmap-dow">${d}</div>`).join("");

  const quadrados = celulas.map(c => {
    if (c === null) return `<div class="heatmap-dia vazio"></div>`;
    if (c === "futuro") return `<div class="heatmap-dia futuro"></div>`;
    const ativo = diaEstaAtivo(c);
    const count = totalQuestoesPorDia(c);
    let nivel = 0;
    if (ativo) {
      nivel = 1;
      if (count >= max * 0.5) nivel = 2;
      if (count >= max * 0.75) nivel = 3;
      if (count >= max) nivel = 4;
    }
    const hoje = c === today ? "hoje" : "";
    const numeroDia = parseInt(c.split("-")[2]);
    return `<div class="heatmap-dia nivel-${nivel} ${hoje}" title="${fmtDateFull(c)} · ${count} questões${!ativo && count > 0 ? ' (abaixo do mínimo de ' + MIN_QUESTOES_DIA_ATIVO + ')' : ''}"><span class="heatmap-dia-num">${numeroDia}</span></div>`;
  }).join("");

  return `
    <div class="card">
      <div class="heatmap-header">
        <span class="icone">${ICONS.flag}</span>
        <span class="titulo">Sua sequência</span>
      </div>
      <div class="subtitle">mínimo ${MIN_QUESTOES_DIA_ATIVO} questões/dia pra contar · borda marca hoje</div>

      <div class="heatmap-nav">
        <button class="btn-icon pequeno" id="heatmap-prev" title="Mês anterior">${ICONS.chevronLeft}</button>
        <span class="heatmap-mes-titulo">${MESES_NOMES[heatmapMes]} ${heatmapAno}${isMesAtual ? " · atual" : ""}</span>
        <button class="btn-icon pequeno" id="heatmap-next" title="Próximo mês" ${podeAvancarMesHeatmap() ? "" : "disabled"}>${ICONS.chevronRight}</button>
      </div>

      <div class="heatmap-dow-row">${cabecalhoDias}</div>
      <div class="heatmap-grid-mes">${quadrados}</div>

      <div class="heatmap-legenda">
        <span>menos</span>
        <div class="heatmap-dia nivel-0" style="aspect-ratio:unset;width:13px;height:13px;"></div>
        <div class="heatmap-dia nivel-1" style="aspect-ratio:unset;width:13px;height:13px;"></div>
        <div class="heatmap-dia nivel-2" style="aspect-ratio:unset;width:13px;height:13px;"></div>
        <div class="heatmap-dia nivel-3" style="aspect-ratio:unset;width:13px;height:13px;"></div>
        <div class="heatmap-dia nivel-4" style="aspect-ratio:unset;width:13px;height:13px;"></div>
        <span>mais</span>
      </div>
    </div>
  `;
}

function renderEvolucao() {
  const sessoesFiltradas = DATA.sessions.filter(s => !filtroEvolucao || s.disciplina === filtroEvolucao);
  const porSemana = {};
  sessoesFiltradas.forEach(s => {
    const w = isoWeek(s.data);
    if (!porSemana[w]) porSemana[w] = { acertos: 0, total: 0 };
    porSemana[w].acertos += s.acertos;
    porSemana[w].total += s.acertos + s.erros;
  });
  const semanas = Object.keys(porSemana).sort();
  const pontos = semanas.map(w => Math.round((porSemana[w].acertos / porSemana[w].total) * 100));

  let corpoChart;
  if (pontos.length < 2) {
    corpoChart = `<div class="empty">Continue registrando sessões — o gráfico de evolução aparece a partir de 2 semanas com dados.</div>`;
  } else {
    const w = 600, h = 160, padX = 30, padY = 20;
    const stepX = (w - padX*2) / (pontos.length - 1);
    const coords = pontos.map((p, i) => [padX + i*stepX, padY + (100-p)/100*(h-padY*2)]);
    const linha = coords.map(c => c.join(",")).join(" ");
    const circulos = coords.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" class="chart-ponto"/>`).join("");
    const labels = semanas.map((s,i) => `<text x="${coords[i][0]}" y="${h-2}" text-anchor="middle" class="chart-label">${s.split("-S")[1]}</text>`).join("");
    corpoChart = `
      <svg viewBox="0 0 ${w} ${h}" class="chart-svg">
        <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${h-padY}" class="chart-eixo"/>
        <line x1="${padX}" y1="${h-padY}" x2="${w-padX}" y2="${h-padY}" class="chart-eixo"/>
        <polyline points="${linha}" class="chart-linha"/>
        ${circulos}
        ${labels}
      </svg>
    `;
  }

  return `
    <div class="card">
      <h3>${ICONS.flag} Evolução ao longo do tempo</h3>
      <div class="evolucao-filtro">
        <select id="filtro-evolucao">
          <option value="">Todas as disciplinas</option>
          ${EDITAL_AGENTE.map(d => `<option value="${d.disciplina}" ${filtroEvolucao === d.disciplina ? "selected" : ""}>${d.disciplina}</option>`).join("")}
        </select>
      </div>
      ${corpoChart}
    </div>
  `;
}

function renderProgresso() {
  const el = document.getElementById("tab-progresso");
  const totalAssuntos = contarAssuntosTotais();
  const iniciados = contarAssuntosIniciados();
  const dominados = contarAssuntosDominados();
  const pctConteudo = totalAssuntos > 0 ? Math.round((dominados/totalAssuntos)*100) : 0;

  let html = `
    <div class="card">
      <h3>${ICONS.flag} Progresso do edital</h3>
      <div class="disc-row">
        <div class="top"><span class="name">Assuntos dominados</span><span class="pct">${dominados}/${totalAssuntos} (${pctConteudo}%)</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pctConteudo}%"></div></div>
      </div>
      <div class="disc-row">
        <div class="top"><span class="name">Assuntos iniciados (pelo menos 1x)</span><span class="pct">${iniciados}/${totalAssuntos}</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${totalAssuntos ? Math.round((iniciados/totalAssuntos)*100) : 0}%"></div></div>
      </div>
    </div>
  `;

  if (DATA.sessions.length === 0) {
    html += `<div class="card"><div class="empty">Sem sessões registradas ainda — o resto do progresso aparece aqui assim que você começar.</div></div>`;
    el.innerHTML = html;
    return;
  }

  const byDisc = {};
  DATA.sessions.forEach(s => {
    if (!byDisc[s.disciplina]) byDisc[s.disciplina] = { acertos: 0, total: 0 };
    byDisc[s.disciplina].acertos += s.acertos;
    byDisc[s.disciplina].total += s.acertos + s.erros;
  });
  const rows = Object.entries(byDisc)
    .map(([disc, v]) => ({ disc, pct: v.total > 0 ? Math.round((v.acertos/v.total)*100) : 0, total: v.total }))
    .sort((a,b) => a.pct - b.pct);

  html += `<div class="card"><h3>${ICONS.target} Acerto por disciplina</h3>`;
  rows.forEach(r => {
    html += `
      <div class="disc-row">
        <div class="top"><span class="name">${r.disc}</span><span class="pct">${r.pct}% · ${r.total}q</span></div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${r.pct}%"></div></div>
      </div>
    `;
  });
  html += `</div>`;

  html += renderPontosFracos();
  html += renderEvolucao();

  el.innerHTML = html;

  const selEvolucao = document.getElementById("filtro-evolucao");
  if (selEvolucao) {
    selEvolucao.addEventListener("change", () => {
      filtroEvolucao = selEvolucao.value;
      renderProgresso();
    });
  }
}

// ============================================================
// ABA: EDITAL
// ============================================================
function renderEdital() {
  const el = document.getElementById("tab-edital");
  const busca = buscaEdital.trim().toLowerCase();

  let html = `
    <div class="card">
      <h3>${ICONS.book} Edital — Agente de Polícia</h3>
      <div class="subtitle">PC-PE · Edital nº 1/2023 (referência)</div>
      <div class="busca-edital">
        <input id="busca-edital-input" type="text" placeholder="Buscar disciplina ou assunto..." value="${buscaEdital}" />
      </div>
      <button class="btn-secundario" disabled title="Em breve: subir um novo edital em PDF e a IA já separa por disciplina/assunto">
        Carregar novo edital (em breve)
      </button>
    </div>
  `;

  EDITAL_AGENTE.forEach((d, idx) => {
    const assuntosFiltrados = busca
      ? d.assuntos.filter(a => a.toLowerCase().includes(busca) || d.disciplina.toLowerCase().includes(busca))
      : d.assuntos;
    if (busca && assuntosFiltrados.length === 0) return;

    const dominados = d.assuntos.filter(a => getAssuntoState(d.disciplina, a).status === "dominado").length;
    const grupo = GRUPOS[d.disciplina] || "C";
    const aberta = busca ? true : disciplinaAberta === idx;

    html += `
      <div class="card disciplina-bloco">
        <div class="disciplina-header" data-idx="${idx}">
          <div class="titulo">
            <span style="transform:rotate(${aberta ? '90deg' : '0deg'});display:inline-flex;transition:transform 0.15s;">${ICONS.chevron}</span>
            <strong>${d.disciplina}</strong>
            <span class="grupo-tag">GRUPO ${grupo}</span>
          </div>
          <span class="contagem">${dominados}/${d.assuntos.length}</span>
        </div>
        ${aberta ? `<div class="assuntos-lista">${assuntosFiltrados.map(a => renderAssuntoItem(d.disciplina, a)).join("")}</div>` : ""}
      </div>
    `;
  });

  el.innerHTML = html;

  document.getElementById("busca-edital-input").addEventListener("input", (e) => {
    buscaEdital = e.target.value;
    renderEdital();
  });
  // mantém o foco no campo de busca após re-render
  if (busca) {
    const input = document.getElementById("busca-edital-input");
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  el.querySelectorAll(".disciplina-header").forEach(h => {
    h.addEventListener("click", () => {
      const idx = parseInt(h.dataset.idx);
      disciplinaAberta = disciplinaAberta === idx ? null : idx;
      renderEdital();
    });
  });

  el.querySelectorAll("[data-assunto-status]").forEach(sel => {
    sel.addEventListener("change", async () => {
      setAssuntoState(sel.dataset.disciplina, sel.dataset.assunto, { status: sel.value });
      await saveData();
      renderEdital();
      renderHoje();
      renderProgresso();
    });
  });

  el.querySelectorAll("[data-assunto-nota]").forEach(ta => {
    ta.addEventListener("blur", async () => {
      setAssuntoState(ta.dataset.disciplina, ta.dataset.assunto, { nota: ta.value });
      await saveData();
    });
  });
}

function renderAssuntoItem(disciplina, assunto) {
  const estado = getAssuntoState(disciplina, assunto);
  return `
    <div class="assunto-item">
      <div class="linha-topo">
        <span class="titulo-assunto status-${estado.status}">${assunto}</span>
        <select data-assunto-status data-disciplina="${disciplina}" data-assunto="${assunto}">
          <option value="nao_iniciado" ${estado.status === "nao_iniciado" ? "selected" : ""}>não iniciado</option>
          <option value="estudando" ${estado.status === "estudando" ? "selected" : ""}>estudando</option>
          <option value="revisando" ${estado.status === "revisando" ? "selected" : ""}>revisando</option>
          <option value="dominado" ${estado.status === "dominado" ? "selected" : ""}>dominado</option>
        </select>
      </div>
      <textarea placeholder="Anotações deste assunto (pegadinhas, artigo específico...)"
        data-assunto-nota data-disciplina="${disciplina}" data-assunto="${assunto}">${estado.nota || ""}</textarea>
    </div>
  `;
}

// ============================================================
// ABA: CRONOGRAMA
// ============================================================
function renderCronograma() {
  const el = document.getElementById("tab-cronograma");
  const dias = ["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
  const opcoesDisc = ["", ...EDITAL_AGENTE.map(d => d.disciplina), "Simulado completo", "Correção + revisão"];

  let html = `<div class="card"><h3>${ICONS.calendar} Seu ciclo de estudos</h3><div class="subtitle">3 blocos por dia — ajuste como quiser</div>`;

  dias.forEach(dia => {
    const slots = DATA.cronograma[dia] || ["", "", ""];
    html += `
      <div class="cronograma-dia">
        <div class="nome-dia">${dia}</div>
        <div class="cronograma-slots">
          ${[0,1,2].map(i => `
            <select data-dia="${dia}" data-slot="${i}">
              ${opcoesDisc.map(o => `<option value="${o}" ${slots[i] === o ? "selected" : ""}>${o || "—"}</option>`).join("")}
            </select>
          `).join("")}
        </div>
      </div>
    `;
  });
  html += `</div><div class="card"><div class="empty">Domingo sem estudo é uma escolha, não uma falha.</div></div>`;
  el.innerHTML = html;

  el.querySelectorAll("select[data-dia]").forEach(sel => {
    sel.addEventListener("change", async () => {
      const dia = sel.dataset.dia;
      const slot = parseInt(sel.dataset.slot);
      if (!DATA.cronograma[dia]) DATA.cronograma[dia] = ["", "", ""];
      DATA.cronograma[dia][slot] = sel.value;
      await saveData();
      showToast("Cronograma atualizado.");
    });
  });
}

// ============================================================
// ABA: CONFIG
// ============================================================
function renderConfig() {
  const el = document.getElementById("tab-config");
  const existeSenha = temPalavraChave();

  el.innerHTML = `
    <div class="card">
      <h3>${ICONS.user} Perfil & Segurança</h3>
      <label>Como você quer ser chamada</label>
      <input id="cfg-apelido" value="${DATA.perfil?.apelido || ''}" placeholder="ex: Lívia" />

      <hr style="border:none;border-top:1px solid var(--borda);margin:20px 0" />

      ${existeSenha ? `
        <div class="badge-senha-ok">${ICONS.check} Palavra-chave definida</div>
        <label>Nova palavra-chave (deixe em branco pra manter a atual)</label>
        <div class="senha-wrap"><input type="password" id="cfg-alt-senha" placeholder="Nova palavra-chave" /><button type="button" class="btn-olho" data-target="cfg-alt-senha">${ICONS_GATE.eye}</button></div>
        <label>Confirmar nova palavra-chave</label>
        <div class="senha-wrap"><input type="password" id="cfg-alt-senha-confirma" placeholder="Repita a nova palavra-chave" /><button type="button" class="btn-olho" data-target="cfg-alt-senha-confirma">${ICONS_GATE.eye}</button></div>
        <div id="cfg-senha-erro" class="gate-erro" style="display:none"></div>
        <button class="btn-primary" id="cfg-alterar-senha-btn">Salvar nova palavra-chave</button>
      ` : `
        <p style="font-size:13px;color:var(--papel-dim);margin-bottom:12px">Você está em modo visitante ou ainda não criou sua palavra-chave. Crie agora pra proteger seu dossiê.</p>
        <label>Criar palavra-chave</label>
        <div class="senha-wrap"><input type="password" id="cfg-nova-senha" placeholder="Nova palavra-chave" /><button type="button" class="btn-olho" data-target="cfg-nova-senha">${ICONS_GATE.eye}</button></div>
        <label>Confirmar</label>
        <div class="senha-wrap"><input type="password" id="cfg-nova-senha-confirma" placeholder="Repita a palavra-chave" /><button type="button" class="btn-olho" data-target="cfg-nova-senha-confirma">${ICONS_GATE.eye}</button></div>
        <label>Pergunta secreta (pra recuperar se esquecer)</label>
        <select id="cfg-pergunta">
          ${PERGUNTAS_SECRETAS.map(p => `<option value="${p}">${p}</option>`).join("")}
        </select>
        <label>Resposta secreta</label>
        <input type="text" id="cfg-resposta" placeholder="Só você sabe..." />
        <div id="cfg-senha-erro" class="gate-erro" style="display:none"></div>
        <button class="btn-primary" id="cfg-criar-senha-btn">Criar palavra-chave</button>
      `}
    </div>

    <div class="card">
      <h3>${ICONS.flag} Meta e prova</h3>
      <label>Data-alvo da prova (provisória, ajuste quando o edital sair)</label>
      <input id="cfg-data-prova" type="date" value="${DATA.config.dataProva || ''}" />
      <label>Meta diária de questões</label>
      <input id="cfg-meta" type="number" min="1" value="${DATA.config.metaDiaria || 80}" />
    </div>

    <div class="card">
      <h3>${ICONS.download} Backup</h3>
      <div class="config-row">
        <div class="desc"><strong>Exportar backup</strong><span>Baixa um arquivo .json com todos os seus dados (sessões, revisões, edital, cronograma).</span></div>
        <button class="btn-config" id="btn-exportar">${ICONS.download} Exportar</button>
      </div>
      <div class="config-row">
        <div class="desc"><strong>Importar backup</strong><span>Substitui os dados atuais pelos do arquivo. Use com cuidado.</span></div>
        <button class="btn-config" id="btn-importar">${ICONS.upload} Importar</button>
        <input type="file" id="input-importar" accept="application/json" />
      </div>
    </div>
  `;

  ligarOlhos(el);

  document.getElementById("cfg-apelido").addEventListener("change", async (e) => {
    if (!DATA.perfil) DATA.perfil = { apelido: "" };
    DATA.perfil.apelido = e.target.value.trim();
    await saveData();
    showToast("Apelido salvo.");
  });

  if (existeSenha) {
    document.getElementById("cfg-alterar-senha-btn").addEventListener("click", async () => {
      const nova = document.getElementById("cfg-alt-senha").value;
      const confirma = document.getElementById("cfg-alt-senha-confirma").value;
      const erroEl = document.getElementById("cfg-senha-erro");
      if (!nova) { erroEl.style.display = "none"; showToast("Nada alterado."); return; }
      if (nova.length < 4) { erroEl.textContent = "A palavra-chave precisa ter pelo menos 4 caracteres."; erroEl.style.display = "block"; return; }
      if (nova !== confirma) { erroEl.textContent = "As palavras-chave não conferem."; erroEl.style.display = "block"; return; }
      DATA.acesso.senhaHash = await hashTexto(nova);
      await saveData();
      showToast("Palavra-chave atualizada.");
      renderConfig();
    });
  } else {
    document.getElementById("cfg-criar-senha-btn").addEventListener("click", async () => {
      const senha = document.getElementById("cfg-nova-senha").value;
      const confirma = document.getElementById("cfg-nova-senha-confirma").value;
      const pergunta = document.getElementById("cfg-pergunta").value;
      const resposta = document.getElementById("cfg-resposta").value;
      const erroEl = document.getElementById("cfg-senha-erro");
      if (senha.length < 4) { erroEl.textContent = "A palavra-chave precisa ter pelo menos 4 caracteres."; erroEl.style.display = "block"; return; }
      if (senha !== confirma) { erroEl.textContent = "As palavras-chave não conferem."; erroEl.style.display = "block"; return; }
      if (!resposta.trim()) { erroEl.textContent = "Preencha a resposta secreta."; erroEl.style.display = "block"; return; }
      DATA.acesso = { senhaHash: await hashTexto(senha), pergunta, respostaHash: await hashTexto(resposta) };
      await saveData();
      modoVisitante = false;
      document.body.classList.remove("modo-visitante");
      const banner = document.getElementById("banner-visitante");
      if (banner) banner.remove();
      showToast("Palavra-chave criada — seu dossiê está protegido agora.");
      renderConfig();
    });
  }

  document.getElementById("btn-exportar").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luia-concursos-backup-${todayLocal()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup baixado.");
  });

  document.getElementById("btn-importar").addEventListener("click", () => {
    document.getElementById("input-importar").click();
  });
  document.getElementById("input-importar").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const novo = JSON.parse(ev.target.result);
        if (!confirm("Isso vai substituir todos os dados atuais pelos do arquivo. Continuar?")) return;
        DATA = Object.assign({ tema: "light", assuntos: {}, cronograma: {}, sessions: [], reviews: [], config: { dataProva: "", metaDiaria: 80 }, acesso: null, perfil: { apelido: "" } }, novo);
        await saveData();
        aplicarTema();
        render();
        showToast("Backup importado com sucesso.");
      } catch (err) {
        showToast("Arquivo inválido. Confira se é um backup do Luia Concursos.");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("cfg-data-prova").addEventListener("change", async (e) => {
    DATA.config.dataProva = e.target.value;
    await saveData();
    showToast("Data da prova atualizada.");
  });
  document.getElementById("cfg-meta").addEventListener("change", async (e) => {
    DATA.config.metaDiaria = parseInt(e.target.value) || 80;
    await saveData();
    showToast("Meta diária atualizada.");
  });
}

// ============================================================
function render() {
  renderHoje();
  renderRegistrar();
  renderProgresso();
  renderEdital();
  renderCronograma();
  renderConfig();
}

// A inicialização (loadData + render) fica em js/init.js,
// carregado por último — depois que supabase-client.js já
// definiu loadData()/saveData().
