/* ============================================================
   LUIA CONCURSOS — inicialização
   Carregado por último: nesse ponto data.js, app.js e
   supabase-client.js já definiram tudo que é preciso.
   ============================================================ */

loadData().then(() => {
  aplicarTema();
  render();
  montarTelaGate();
});
