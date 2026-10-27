import { FormEvent, useEffect, useState } from 'react';
import api from '../api/client';
import { CalendarioResponse, Licao, Trimestre } from '../types';

export default function Calendario() {
  const [calendario, setCalendario] = useState<CalendarioResponse | null>(null);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [trimestreId, setTrimestreId] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anoAtual);
  const [numero, setNumero] = useState(1);
  const [tituloRevista, setTituloRevista] = useState('');
  const [dataInicio, setDataInicio] = useState('');

  function hojeISO() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  }

  function semDuplicatas(items: Trimestre[]) {
    const vistos = new Set<string>();
    return [...items]
      .sort((a, b) => a.id - b.id)
      .filter((trimestre) => {
        const chave = `${trimestre.ano}-${trimestre.numero}`;
        if (vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
      });
  }

  async function carregarLicoes(trimestre: Trimestre) {
    setCarregando(true);
    try {
      const { data: licoes } = await api.get<Licao[]>(`/licoes?trimestreId=${trimestre.id}`);
      const licaoAtual = licoes.find((licao) => licao.data === hojeISO()) || null;
      setCalendario({
        trimestre,
        licoes,
        licaoAtual,
        numeroLicaoAtual: licaoAtual?.numero ?? null,
      });
    } finally {
      setCarregando(false);
    }
  }

  async function carregar() {
    setCarregando(true);
    try {
      const { data } = await api.get<Trimestre[]>('/trimestres');
      const disponiveis = semDuplicatas(data);
      setTrimestres(disponiveis);
      const hoje = hojeISO();
      const selecionado = disponiveis.find((t) => t.dataInicio <= hoje && t.dataFim >= hoje)
        || [...disponiveis].sort((a, b) => b.dataInicio.localeCompare(a.dataInicio))[0];
      if (!selecionado) {
        setCalendario(null);
        setTrimestreId('');
        return;
      }
      setTrimestreId(String(selecionado.id));
      await carregarLicoes(selecionado);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criarTrimestre(e: FormEvent) {
    e.preventDefault();
    await api.post('/trimestres', {
      ano,
      numero,
      tituloRevista,
      dataInicio,
    });
    setMostrarForm(false);
    carregar();
  }

  function selecionarTrimestre(id: string) {
    setTrimestreId(id);
    const trimestre = trimestres.find((item) => String(item.id) === id);
    if (trimestre) carregarLicoes(trimestre);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h3 className="font-principal text-brand-primary mb-1">Calendário do Trimestre</h3>
          <p className="text-secondary mb-0">Acompanhe as 13 lições da Escola Dominical, uma por domingo.</p>
        </div>
        <button className="btn btn-admig" onClick={() => setMostrarForm((v) => !v)}>
          <i className="bi bi-plus-lg me-1" /> Novo trimestre
        </button>
      </div>

      {trimestres.length > 0 && (
        <div className="mb-3" style={{ maxWidth: 360 }}>
          <label className="form-label small fw-semibold">Trimestre</label>
          <select className="form-select" value={trimestreId} onChange={(e) => selecionarTrimestre(e.target.value)}>
            {trimestres.map((t) => (
              <option key={t.id} value={t.id}>{t.numero}º Trimestre / {t.ano}{t.tituloRevista ? ` — ${t.tituloRevista}` : ''}</option>
            ))}
          </select>
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={criarTrimestre} className="card card-admig p-3 mb-4">
          <div className="row g-2">
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold">Ano</label>
              <input type="number" className="form-control" value={ano} onChange={(e) => setAno(Number(e.target.value))} required />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold">Nº do trimestre</label>
              <select className="form-select" value={numero} onChange={(e) => setNumero(Number(e.target.value))}>
                <option value={1}>1º</option>
                <option value={2}>2º</option>
                <option value={3}>3º</option>
                <option value={4}>4º</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Título da revista</label>
              <input className="form-control" value={tituloRevista} onChange={(e) => setTituloRevista(e.target.value)} placeholder="Ex: A vida de Davi" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Data da 1ª lição (domingo)</label>
              <input type="date" className="form-control" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-admig">Criar trimestre e gerar as 13 lições</button>
          </div>
        </form>
      )}

      {carregando ? (
        <div className="text-secondary">Carregando...</div>
      ) : calendario?.trimestre ? (
        <div className="card card-admig p-4">
          <div className="mb-3">
            <div className="text-secondary small text-uppercase fw-semibold">Trimestre selecionado</div>
            <div className="fs-5 fw-bold">
              {calendario.trimestre.numero}º Trimestre / {calendario.trimestre.ano}
              {calendario.trimestre.tituloRevista ? ` — ${calendario.trimestre.tituloRevista}` : ''}
            </div>
            <div className="text-secondary small">
              De {calendario.trimestre.dataInicio} até {calendario.trimestre.dataFim}
            </div>
          </div>

          <div className="row g-3">
            {calendario.licoes.map((l) => {
              const status = calendario.numeroLicaoAtual
                ? l.numero < calendario.numeroLicaoAtual
                  ? 'passada'
                  : l.numero === calendario.numeroLicaoAtual
                  ? 'atual'
                  : 'futura'
                : 'futura';
              return (
                <div key={l.id} className="col-6 col-md-4 col-lg-3">
                  <div className={`card card-admig p-3 h-100 ${status === 'atual' ? 'border border-2' : ''}`}
                       style={status === 'atual' ? { borderColor: 'var(--admig-dourado)' } : {}}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className={`licao-pill ${status}`}>{l.numero}</div>
                      <span className="fw-semibold">Lição {l.numero}</span>
                    </div>
                    <div className="text-secondary small">{l.data}</div>
                    {l.titulo && <div className="small mt-1">{l.titulo}</div>}
                    {status === 'atual' && <span className="badge bg-brand-gold text-brand-navy mt-2 align-self-start">Lição atual</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-secondary">Nenhum trimestre ativo para a data de hoje. Cadastre um novo trimestre acima.</div>
      )}
    </div>
  );
}
