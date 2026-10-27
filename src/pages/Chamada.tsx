import { useEffect, useState } from 'react';
import api from '../api/client';
import { Aluno, CalendarioResponse, Classe, Licao, NOMES_CLASSE, Presenca, Trimestre } from '../types';

interface ItemChamada {
  alunoId: number;
  nome: string;
  presente: boolean;
}

export default function Chamada() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [classeId, setClasseId] = useState('');
  const [calendario, setCalendario] = useState<CalendarioResponse | null>(null);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [trimestreId, setTrimestreId] = useState('');
  const [carregandoLicoes, setCarregandoLicoes] = useState(false);
  const [licaoId, setLicaoId] = useState('');
  const [itens, setItens] = useState<ItemChamada[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    let cancelado = false;
    Promise.all([api.get<Classe[]>('/classes'), api.get<Trimestre[]>('/trimestres')]).then(([classesRes, trimestresRes]) => {
      if (cancelado) return;
      setClasses(classesRes.data);
      const vistos = new Set<string>();
      const disponiveis = [...trimestresRes.data].sort((a, b) => a.id - b.id).filter((trimestre) => {
        const chave = `${trimestre.ano}-${trimestre.numero}`;
        if (vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
      });
      setTrimestres(disponiveis);
      const agora = new Date();
      const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
      const selecionado = disponiveis.find((t) => t.dataInicio <= hoje && t.dataFim >= hoje)
        || [...disponiveis].sort((a, b) => b.dataInicio.localeCompare(a.dataInicio))[0];
      if (selecionado) setTrimestreId(String(selecionado.id));
    });
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    const trimestre = trimestres.find((item) => String(item.id) === trimestreId);
    if (!trimestre) return;
    let cancelado = false;
    setCarregandoLicoes(true);
    api.get<Licao[]>(`/licoes?trimestreId=${trimestre.id}`).then(({ data: licoes }) => {
      if (cancelado) return;
      const agora = new Date();
      const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
      const licaoAtual = licoes.find((licao) => licao.data === hoje) || null;
      setCalendario({ trimestre, licoes, licaoAtual, numeroLicaoAtual: licaoAtual?.numero ?? null });
      const ultimaComTitulo = [...licoes].reverse().find((licao) => licao.titulo?.trim());
      const licaoInicial = licaoAtual || ultimaComTitulo || licoes[0];
      setLicaoId(licaoInicial ? String(licaoInicial.id) : '');
    }).finally(() => {
      if (!cancelado) setCarregandoLicoes(false);
    });
    return () => { cancelado = true; };
  }, [trimestreId, trimestres]);

  useEffect(() => {
    if (!classeId || !licaoId) {
      setItens([]);
      return;
    }
    setCarregando(true);
    setSucesso(false);
    Promise.all([
      api.get<Aluno[]>(`/alunos?classeId=${classeId}`),
      api.get<Presenca[]>(`/presencas?licaoId=${licaoId}&classeId=${classeId}`),
    ])
      .then(([alunosRes, presencasRes]) => {
        const presencasPorAluno = new Map(presencasRes.data.map((p) => [p.aluno.id, p.presente]));
        setItens(
          alunosRes.data
            .filter((a) => a.ativo)
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
            .map((a) => ({
              alunoId: a.id,
              nome: a.nome,
              presente: presencasPorAluno.get(a.id) ?? true,
            }))
        );
      })
      .finally(() => setCarregando(false));
  }, [classeId, licaoId]);

  function toggle(alunoId: number) {
    setItens((prev) => prev.map((i) => (i.alunoId === alunoId ? { ...i, presente: !i.presente } : i)));
  }

  function marcarTodos(presente: boolean) {
    setItens((prev) => prev.map((i) => ({ ...i, presente })));
  }

  async function salvar() {
    setSalvando(true);
    setSucesso(false);
    try {
      await api.post('/presencas/chamada', {
        licaoId: Number(licaoId),
        itens: itens.map((i) => ({ alunoId: i.alunoId, presente: i.presente })),
      });
      setSucesso(true);
    } finally {
      setSalvando(false);
    }
  }

  const licaoSelecionada = calendario?.licoes.find((l) => String(l.id) === licaoId);
  const totalPresentes = itens.filter((i) => i.presente).length;

  return (
    <div>
      <h3 className="font-principal text-brand-primary mb-1">Chamada</h3>
      <p className="text-secondary mb-4">Registre a presença dos alunos na lição de domingo.</p>

      <div className="card card-admig p-3 mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">Trimestre</label>
            <select className="form-select" value={trimestreId} onChange={(e) => setTrimestreId(e.target.value)}>
              <option value="">Selecione o trimestre</option>
              {trimestres.map((t) => (
                <option key={t.id} value={t.id}>{t.numero}º Trimestre / {t.ano}{t.tituloRevista ? ` — ${t.tituloRevista}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">Classe</label>
            <select className="form-select" value={classeId} onChange={(e) => setClasseId(e.target.value)}>
              <option value="">Selecione a classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {NOMES_CLASSE[c.categoria].grupo} — {NOMES_CLASSE[c.categoria].nome}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold">Lição</label>
            <select className="form-select" value={licaoId} onChange={(e) => setLicaoId(e.target.value)}>
              <option value="">Selecione a lição</option>
              {calendario?.licoes.map((l) => (
                <option key={l.id} value={l.id}>
                  Lição {l.numero} — {l.data}{l.titulo?.trim() ? ` — ${l.titulo}` : ''}
                  {calendario.numeroLicaoAtual === l.numero ? ' (atual)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {carregando && <div className="text-secondary">Carregando alunos...</div>}
      {carregandoLicoes && <div className="text-secondary mb-3">Carregando lições...</div>}

      {!carregando && classeId && licaoId && (
        <div className="card card-admig p-0">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 p-3 border-bottom">
            <div className="fw-semibold">
              {licaoSelecionada ? `Lição ${licaoSelecionada.numero}` : ''} — {totalPresentes}/{itens.length} presentes
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-admig-outline" onClick={() => marcarTodos(true)}>Marcar todos presentes</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => marcarTodos(false)}>Marcar todos ausentes</button>
            </div>
          </div>

          <ul className="list-group list-group-flush">
            {itens.map((i) => (
              <li key={i.alunoId} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{i.nome}</span>
                <button
                  className={`badge border-0 px-3 py-2 ${i.presente ? 'badge-presente' : 'badge-falta'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggle(i.alunoId)}
                >
                  {i.presente ? 'Presente' : 'Falta'}
                </button>
              </li>
            ))}
            {itens.length === 0 && (
              <li className="list-group-item text-center text-secondary py-4">Nenhum aluno ativo nesta classe.</li>
            )}
          </ul>

          <div className="p-3 border-top d-flex align-items-center gap-3">
            <button className="btn btn-admig" onClick={salvar} disabled={salvando || itens.length === 0}>
              {salvando ? 'Salvando...' : 'Salvar chamada'}
            </button>
            {sucesso && <span className="text-success"><i className="bi bi-check-circle me-1" />Chamada salva com sucesso!</span>}
          </div>
        </div>
      )}

      {!classeId || !licaoId ? (
        <div className="text-secondary mt-3">Selecione a classe e a lição para começar a chamada.</div>
      ) : null}
    </div>
  );
}
