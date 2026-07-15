/* ============================================================
   LUIA CONCURSOS — trava de acesso por palavra-chave
   Mesma lógica do Luia: cria na primeira vez, pede a cada
   carregamento, recupera por pergunta secreta.
   ============================================================ */

const PERGUNTAS_SECRETAS = [
  "Nome do seu primeiro animal de estimação",
  "Cidade onde você nasceu",
  "Nome da sua mãe",
  "Comida que você mais gosta",
  "Apelido de infância"
];

async function hashTexto(texto) {
  const enc = new TextEncoder().encode(texto.trim().toLowerCase());
  const buffer = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function temPalavraChave() {
  return !!(DATA.acesso && DATA.acesso.senhaHash);
}

function montarTelaGate() {
  const overlay = document.getElementById("gate-overlay");
  if (!temPalavraChave()) {
    overlay.innerHTML = telaCriarSenha();
    ligarEventosCriarSenha();
  } else {
    overlay.innerHTML = telaDigitarSenha();
    ligarEventosDigitarSenha();
  }
}

function telaCriarSenha() {
  return `
    <div class="gate-card">
      <div class="selo" style="margin:0 auto 16px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13z"/></svg>
      </div>
      <h2 style="text-align:center;margin-bottom:6px">Vamos proteger seu dossiê</h2>
      <p style="text-align:center;color:var(--papel-dim);font-size:13.5px;margin-bottom:20px">
        Crie uma palavra-chave — vamos pedir ela toda vez que você abrir o app.
      </p>
      <label>Palavra-chave</label>
      <input type="password" id="gate-senha" placeholder="Digite sua palavra-chave" />
      <label>Confirmar palavra-chave</label>
      <input type="password" id="gate-senha-confirma" placeholder="Repita a palavra-chave" />
      <label>Pergunta secreta (pra recuperar se esquecer)</label>
      <select id="gate-pergunta">
        ${PERGUNTAS_SECRETAS.map(p => `<option value="${p}">${p}</option>`).join("")}
      </select>
      <label>Resposta secreta</label>
      <input type="text" id="gate-resposta" placeholder="Só você sabe..." />
      <div id="gate-erro" class="gate-erro" style="display:none"></div>
      <button class="btn-primary" id="gate-criar-btn" style="margin-top:20px">Criar e entrar</button>
    </div>
  `;
}

function telaDigitarSenha() {
  return `
    <div class="gate-card">
      <div class="selo" style="margin:0 auto 16px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5c-.8 0-1.5-.7-1.5-1.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13z"/></svg>
      </div>
      <h2 style="text-align:center;margin-bottom:6px">Olá de novo</h2>
      <p style="text-align:center;color:var(--papel-dim);font-size:13.5px;margin-bottom:20px">
        Digite sua palavra-chave pra carregar seu dossiê.
      </p>
      <label>Palavra-chave</label>
      <input type="password" id="gate-senha-entrar" placeholder="Digite sua palavra-chave" autofocus />
      <div id="gate-erro" class="gate-erro" style="display:none"></div>
      <button class="btn-primary" id="gate-entrar-btn" style="margin-top:16px">Entrar</button>
      <button class="btn-link" id="gate-esqueci-btn">Esqueci minha palavra-chave</button>
    </div>
  `;
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

function ligarEventosCriarSenha() {
  document.getElementById("gate-criar-btn").addEventListener("click", async () => {
    const senha = document.getElementById("gate-senha").value;
    const confirma = document.getElementById("gate-senha-confirma").value;
    const pergunta = document.getElementById("gate-pergunta").value;
    const resposta = document.getElementById("gate-resposta").value;

    if (senha.length < 4) return mostrarErroGate("A palavra-chave precisa ter pelo menos 4 caracteres.");
    if (senha !== confirma) return mostrarErroGate("As palavras-chave não conferem.");
    if (!resposta.trim()) return mostrarErroGate("Preencha a resposta secreta.");

    DATA.acesso = {
      senhaHash: await hashTexto(senha),
      pergunta,
      respostaHash: await hashTexto(resposta)
    };
    await saveData();
    desbloquear();
  });
}

function ligarEventosDigitarSenha() {
  const input = document.getElementById("gate-senha-entrar");
  document.getElementById("gate-entrar-btn").addEventListener("click", tentarEntrar);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") tentarEntrar(); });

  async function tentarEntrar() {
    const senha = input.value;
    const hash = await hashTexto(senha);
    if (hash === DATA.acesso.senhaHash) {
      desbloquear();
    } else {
      mostrarErroGate("Palavra-chave incorreta.");
    }
  }

  document.getElementById("gate-esqueci-btn").addEventListener("click", () => {
    document.getElementById("gate-overlay").innerHTML = telaRecuperar();
    ligarEventosRecuperar();
  });
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
    document.getElementById("gate-overlay").innerHTML = telaDigitarSenha();
    ligarEventosDigitarSenha();
  });
}

function telaNovaSenha() {
  return `
    <div class="gate-card">
      <h2 style="text-align:center;margin-bottom:6px">Definir nova palavra-chave</h2>
      <label>Nova palavra-chave</label>
      <input type="password" id="gate-nova-senha" placeholder="Digite a nova palavra-chave" />
      <label>Confirmar</label>
      <input type="password" id="gate-nova-senha-confirma" placeholder="Repita a nova palavra-chave" />
      <div id="gate-erro" class="gate-erro" style="display:none"></div>
      <button class="btn-primary" id="gate-salvar-nova-btn" style="margin-top:16px">Salvar e entrar</button>
    </div>
  `;
}

function ligarEventosNovaSenha() {
  document.getElementById("gate-salvar-nova-btn").addEventListener("click", async () => {
    const senha = document.getElementById("gate-nova-senha").value;
    const confirma = document.getElementById("gate-nova-senha-confirma").value;
    if (senha.length < 4) return mostrarErroGate("A palavra-chave precisa ter pelo menos 4 caracteres.");
    if (senha !== confirma) return mostrarErroGate("As palavras-chave não conferem.");
    DATA.acesso.senhaHash = await hashTexto(senha);
    await saveData();
    desbloquear();
  });
}

function desbloquear() {
  document.getElementById("gate-overlay").style.display = "none";
  document.querySelector(".wrap").style.display = "block";
  aplicarTema();
  render();
}
