/* ============================================================
   LUIA CONCURSOS — persistência via Supabase
   Substitui o antigo window.storage. Requer o script do
   supabase-js carregado ANTES deste arquivo (ver index.html).

   PREENCHA AQUI com os dados do seu projeto Supabase:
   Painel do projeto → Project Settings → API
   ============================================================ */

const SUPABASE_URL = "https://oghewanuhbspxqjpracv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_A73hxAd8-wb6SXz6TmGg3w_TYQ_mmnP";

const DEFAULT_DATA = {
  tema: "light",
  assuntos: {},
  cronograma: {},
  sessions: [],
  reviews: [],
  config: { dataProva: "", metaDiaria: 80 },
  acesso: null,
  perfil: { apelido: "" }
};

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadData() {
  try {
    const { data, error } = await supabaseClient
      .from("pcpe_state")
      .select("data")
      .eq("id", 1)
      .single();

    if (error || !data) {
      console.warn("Não encontrei dados no Supabase ainda, usando estado inicial.", error);
      DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));
    } else {
      DATA = Object.assign(JSON.parse(JSON.stringify(DEFAULT_DATA)), data.data);
      if (!DATA.config) DATA.config = { dataProva: "", metaDiaria: 80 };
    }
  } catch (e) {
    console.error("Erro ao carregar do Supabase:", e);
    showToastSeguro("Não consegui conectar ao banco. Verifique sua internet e recarregue.");
    DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  if (!DATA.cronograma || Object.keys(DATA.cronograma).length === 0) {
    DATA.cronograma = JSON.parse(JSON.stringify(CRONOGRAMA_PADRAO));
  }
  if (!DATA.tema) DATA.tema = "light";
}

async function saveData() {
  try {
    const { error } = await supabaseClient
      .from("pcpe_state")
      .upsert({ id: 1, data: DATA, updated_at: new Date().toISOString() });

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      showToastSeguro("Não consegui salvar agora. Verifique sua internet.");
    }
  } catch (e) {
    console.error("Erro ao salvar no Supabase:", e);
    showToastSeguro("Não consegui salvar agora. Verifique sua internet.");
  }
}

// evita quebrar caso showToast ainda não exista no momento da chamada
function showToastSeguro(msg) {
  if (typeof showToast === "function") showToast(msg);
  else console.warn(msg);
}
