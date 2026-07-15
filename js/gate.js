/* ============================================================
   LUIA CONCURSOS — trava de acesso por palavra-chave
   Fluxo:
   - Tela de entrada: sempre pede a palavra-chave (se já existe)
     OU oferece "entrar como visitante" (se ainda não existe).
   - Criar/alterar a palavra-chave de verdade acontece dentro do
     app, em Config → Perfil & Segurança (ver app.js).
   - Modo visitante: navega em tudo, mas nenhuma ação salva nada.
   ============================================================ */

const PERGUNTAS_SECRETAS = [
  "Nome do seu primeiro animal de estimação",
  "Cidade onde você nasceu",
  "Nome da sua mãe",
  "Comida que você mais gosta",
  "Apelido de infância"
];

let modoVisitante = false;

const ICONS_GATE = {
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M9.9 4.24A11 11 0 0123 12s-1.5 2.6-4.1 4.6M6.1 6.1C3.6 7.9 1 12 1 12s3.4 6 10.9 6c1.2 0 2.3-.15 3.3-.43"/></svg>`
};

async function hashTexto(texto) {
  const enc = new TextEncoder().encode(texto.trim().toLowerCase());
  const buffer = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function temPalavraChave() {
  return !!(DATA.acesso && DATA.acesso.senhaHash);
}

function inputComOlho(id, placeholder) {
  return `
    <div class="senha-wrap">
      <input type="password" id="${id}" placeholder="${placeholder}" />
      <button type="button" class="btn-olho" data-target="${id}">${ICONS_GATE.eye}</button>
    </div>
  `;
}

function ligarOlhos(container) {
  container.querySelectorAll(".btn-olho").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.innerHTML = isPassword ? ICONS_GATE.eyeOff : ICONS_GATE.eye;
    });
  });
}

function montarTelaGate() {
  const overlay = document.getElementById("gate-overlay");
  overlay.innerHTML = telaEntrar();
  ligarEventosEntrar();
  ligarOlhos(overlay);
}

function nomeParaSaudacao() {
  const apelido = DATA.perfil && DATA.perfil.apelido;
  return apelido ? `Olá, ${apelido}!` : "Olá!";
}

function telaEntrar() {
  const existeSenha = temPalavraChave();
  return `
    <div class="gate-card">
      <div class="selo" style="margin:0 auto 16px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13z"/></svg>
      </div>
      <h2 style="text-align:center;margin-bottom:6px">${nomeParaSaudacao()}</h2>
      <p style="text-align:center;color:var(--papel-dim);font-size:13.5px;margin-bottom:20px">
        ${existeSenha ? "Digite sua palavra-chave pra carregar seus dados." : "Ainda não há palavra-chave criada pra esse dossiê."}
      </p>
      ${existeSenha ? `
        <label>Palavra-chave</label>
        ${inputComOlho("gate-senha-entrar", "Digite sua palavra-chave")}
        <div id="gate-erro" class="gate-erro" style="display:none"></div>
        <button class="btn-primary" id="gate-entrar-btn" style="margin-top:16px">Entrar</button>
        <button class="btn-link" id="gate-esqueci-btn">Esqueci minha palavra-chave</button>
      ` : `
        <div id="gate-erro" class="gate-erro" style="display:none"></div>
        <button class="btn-primary" id="gate-visitante-btn" style="margin-top:6px">Entrar como visitante</button>
        <p style="text-align:center;color:var(--papel-dim);font-size:12px;margin-top:14px">
          No modo visitante você navega e vê tudo, mas nada pode ser salvo.
          Crie sua palavra-chave depois, em Config → Perfil &amp; Segurança.
        </p>
      `}
    </div>
  `;
}

function ligarEventosEntrar() {
  const existeSenha = temPalavraChave();

  if (existeSenha) {
    const input = document.getElementById("gate-senha-entrar");
    document.getElementById("gate-entrar-btn").addEventListener("click", tentarEntrar);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") tentarEntrar(); });

    async function tentarEntrar() {
      const senha = input.value;
      const hash = await hashTexto(senha);
      if (hash === DATA.acesso.senhaHash) {
        desbloquear(false);
      } else {
        mostrarErroGate("Palavra-chave incorreta.");
      }
    }

    document.getElementById("gate-esqueci-btn").addEventListener("click", () => {
      document.getElementById("gate-overlay").innerHTML = telaRecuperar();
      ligarEventosRecuperar();
    });
  } else {
    document.getElementById("gate-visitante-btn").addEventListener("click", () => {
      desbloquear(true);
    });
  }
}

function telaRecuperar() {
  return `
    <div class="gate-card">
      <h2 style="text-align:center;margin-bottom:6px">Recuperar acesso</h2>
      <p style="text-align:center;color:var(--papel-dim);font-size:13.5px;margin-bottom:20px">
        ${DATA.acesso.pergunta}
      </p>
      <label>Resposta secreta</label>
      <input type="text" id="gate-resposta-recuperar" placeholder="Sua resposta" />
      <div id="gate-erro" class="gate-erro" style="display:none"></div>
      <button class="btn-primary" id="gate-verificar-btn" style="margin-top:16px">Verificar</button>
      <button class="btn-link" id="gate-voltar-btn">Voltar</button>
    </div>
  `;
}

function mostrarErroGate(msg) {
  const el = document.getElementById("gate-erro");
  el.textContent = msg;
  el.style.display = "block";
}

function ligarEventosRecuperar() {
  document.getElementById("gate-verificar-btn").addEventListener("click", async () => {
    const resposta = document.getElementById("gate-resposta-recuperar").value;
    const hash = await hashTexto(resposta);
    if (hash === DATA.acesso.respostaHash) {
      document.getElementById("gate-overlay").innerHTML = telaNovaSenha();
      ligarEventosNovaSenha();
    } else {
      mostrarErroGate("Resposta incorreta.");
    }
  });
  document.getElementById("gate-voltar-btn").addEventListener("click", () => {
    document.getElementById("gate-overlay").innerHTML = telaEntrar();
    ligarEventosEntrar();
  });
}

function telaNovaSenha() {
  return `
    <div class="gate-card">
      <h2 style="text-align:center;margin-bottom:6px">Definir nova palavra-chave</h2>
      <label>Nova palavra-chave</label>
      ${inputComOlho("gate-nova-senha", "Digite a nova palavra-chave")}
      <label>Confirmar</label>
      ${inputComOlho("gate-nova-senha-confirma", "Repita a nova palavra-chave")}
      <div id="gate-erro" class="gate-erro" style="display:none"></div>
      <button class="btn-primary" id="gate-salvar-nova-btn" style="margin-top:16px">Salvar e entrar</button>
    </div>
  `;
}

function ligarEventosNovaSenha() {
  ligarOlhos(document.getElementById("gate-overlay"));
  document.getElementById("gate-salvar-nova-btn").addEventListener("click", async () => {
    const senha = document.getElementById("gate-nova-senha").value;
    const confirma = document.getElementById("gate-nova-senha-confirma").value;
    if (senha.length < 4) return mostrarErroGate("A palavra-chave precisa ter pelo menos 4 caracteres.");
    if (senha !== confirma) return mostrarErroGate("As palavras-chave não conferem.");
    DATA.acesso.senhaHash = await hashTexto(senha);
    await saveData();
    desbloquear(false);
  });
}

function desbloquear(comoVisitante) {
  modoVisitante = comoVisitante;
  document.getElementById("gate-overlay").classList.remove("ativo");
  document.body.classList.remove("gate-ativo");
  document.body.classList.toggle("modo-visitante", modoVisitante);
  aplicarTema();
  render();
  montarBannerVisitante();
}

function montarBannerVisitante() {
  const existente = document.getElementById("banner-visitante");
  if (existente) existente.remove();
  if (!modoVisitante) return;
  const banner = document.createElement("div");
  banner.id = "banner-visitante";
  banner.className = "banner-visitante";
  banner.innerHTML = `
    <span>Modo visitante — você está só visualizando.</span>
    <button id="banner-visitante-sair">Entrar com senha</button>
  `;
  document.querySelector(".wrap").prepend(banner);
  document.getElementById("banner-visitante-sair").addEventListener("click", () => {
    document.body.classList.remove("modo-visitante");
    modoVisitante = false;
    banner.remove();
    document.body.classList.add("gate-ativo");
    document.getElementById("gate-overlay").classList.add("ativo");
    montarTelaGate();
  });
}
