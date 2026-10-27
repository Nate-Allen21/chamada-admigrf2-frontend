import { useEffect, useState } from 'react';
import api from '../api/client';
import { Aluno, Classe, Licao, NOMES_CLASSE, Presenca, Trimestre } from '../types';

type EstadoPresenca = boolean | null;

interface AlunoRelatorio {
  aluno: Aluno;
  estados: EstadoPresenca[];
  presentes: number;
  faltas: number;
  semRegistro: number;
}

interface ClasseRelatorio {
  classe: Classe;
  alunos: AlunoRelatorio[];
  presentes: number;
  faltas: number;
  semRegistro: number;
}

interface RelatorioGerado {
  trimestre: Trimestre;
  licoes: Licao[];
  classes: ClasseRelatorio[];
}

function compararNomes(a: string, b: string) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function formatarData(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
}

function formatarEstado(estado: EstadoPresenca) {
  if (estado === true) return 'Presente';
  if (estado === false) return 'Falta';
  return 'Sem registro';
}

export default function Relatorios() {
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [trimestreId, setTrimestreId] = useState('');
  const [relatorio, setRelatorio] = useState<RelatorioGerado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get<Trimestre[]>('/trimestres').then(({ data }) => {
      const vistos = new Set<string>();
      const unicos = [...data].sort((a, b) => a.id - b.id).filter((trimestre) => {
        const chave = `${trimestre.ano}-${trimestre.numero}`;
        if (vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
      }).sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));
      setTrimestres(unicos);
      if (unicos.length > 0) setTrimestreId(String(unicos[0].id));
    }).catch(() => setErro('Não foi possível carregar os trimestres.'));
  }, []);

  async function gerarRelatorio() {
    const trimestre = trimestres.find((item) => String(item.id) === trimestreId);
    if (!trimestre) return;

    setCarregando(true);
    setErro('');
    setRelatorio(null);
    try {
      const [{ data: classes }, { data: licoes }] = await Promise.all([
        api.get<Classe[]>('/classes'),
        api.get<Licao[]>(`/licoes?trimestreId=${trimestre.id}`),
      ]);
      const classesAtivas = classes.filter((classe) => classe.ativo).sort((a, b) =>
        compararNomes(NOMES_CLASSE[a.categoria].nome, NOMES_CLASSE[b.categoria].nome)
      );
      const licoesOrdenadas = [...licoes].sort((a, b) => a.numero - b.numero);
      const alunosPorClasse = await Promise.all(classesAtivas.map(async (classe) => {
        const { data } = await api.get<Aluno[]>(`/alunos?classeId=${classe.id}`);
        return data.sort((a, b) => compararNomes(a.nome, b.nome));
      }));
      const estadosPorAluno = new Map<number, Map<number, boolean>>();

      for (const licao of licoesOrdenadas) {
        const presencasPorClasse = await Promise.all(classesAtivas.map(async (classe) => {
          const { data } = await api.get<Presenca[]>(`/presencas?licaoId=${licao.id}&classeId=${classe.id}`);
          return data;
        }));
        for (const presencas of presencasPorClasse) {
          for (const presenca of presencas) {
            const registros = estadosPorAluno.get(presenca.aluno.id) || new Map<number, boolean>();
            registros.set(licao.id, presenca.presente);
            estadosPorAluno.set(presenca.aluno.id, registros);
          }
        }
      }

      const classesRelatorio = classesAtivas.map((classe, index) => {
        const alunos = alunosPorClasse[index].map((aluno): AlunoRelatorio => {
          const registros = estadosPorAluno.get(aluno.id);
          const estados = licoesOrdenadas.map((licao) => registros?.get(licao.id) ?? null);
          const presentes = estados.filter((estado) => estado === true).length;
          const faltas = estados.filter((estado) => estado === false).length;
          return { aluno, estados, presentes, faltas, semRegistro: estados.length - presentes - faltas };
        });
        return {
          classe,
          alunos,
          presentes: alunos.reduce((total, aluno) => total + aluno.presentes, 0),
          faltas: alunos.reduce((total, aluno) => total + aluno.faltas, 0),
          semRegistro: alunos.reduce((total, aluno) => total + aluno.semRegistro, 0),
        };
      });
      setRelatorio({ trimestre, licoes: licoesOrdenadas, classes: classesRelatorio });
    } catch {
      setErro('Não foi possível gerar o relatório. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  function exportarCsv() {
    if (!relatorio) return;
    const escapar = (valor: string) => `"${valor.replace(/"/g, '""')}"`;
    const linhas = [[
      'Trimestre', 'Classe', 'Aluno', 'Presenças', 'Faltas', 'Sem registro',
      ...relatorio.licoes.map((licao) => `Lição ${licao.numero}: ${licao.titulo || ''} (${licao.data})`),
    ]];
    for (const classe of relatorio.classes) {
      for (const aluno of classe.alunos) {
        linhas.push([
          `${relatorio.trimestre.numero}º trimestre ${relatorio.trimestre.ano}`,
          NOMES_CLASSE[classe.classe.categoria].nome,
          aluno.aluno.nome,
          String(aluno.presentes),
          String(aluno.faltas),
          String(aluno.semRegistro),
          ...aluno.estados.map(formatarEstado),
        ]);
      }
    }
    const conteudo = `\uFEFF${linhas.map((linha) => linha.map(escapar).join(';')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-ebd-${relatorio.trimestre.ano}-t${relatorio.trimestre.numero}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const totalPresentes = relatorio?.classes.reduce((total, classe) => total + classe.presentes, 0) || 0;
  const totalFaltas = relatorio?.classes.reduce((total, classe) => total + classe.faltas, 0) || 0;
  const totalSemRegistro = relatorio?.classes.reduce((total, classe) => total + classe.semRegistro, 0) || 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h3 className="font-principal text-brand-primary mb-1">Relatório de frequência</h3>
          <p className="text-secondary mb-0">Presenças e faltas organizadas por classe e lição.</p>
        </div>
        {relatorio && (
          <div className="d-flex gap-2">
            <button className="btn btn-admig-outline" onClick={exportarCsv} title="Baixar relatório CSV">
              <i className="bi bi-download me-1" /> CSV
            </button>
            <button className="btn btn-admig-outline" onClick={() => window.print()} title="Imprimir relatório">
              <i className="bi bi-printer me-1" /> Imprimir
            </button>
          </div>
        )}
      </div>

      <div className="d-flex align-items-end gap-2 flex-wrap mb-4">
        <div style={{ minWidth: 260, maxWidth: 420, flex: '1 1 260px' }}>
          <label htmlFor="relatorio-trimestre" className="form-label small fw-semibold">Trimestre</label>
          <select id="relatorio-trimestre" className="form-select" value={trimestreId} onChange={(e) => setTrimestreId(e.target.value)}>
            <option value="">Selecione o trimestre</option>
            {trimestres.map((trimestre) => (
              <option key={trimestre.id} value={trimestre.id}>
                {trimestre.numero}º Trimestre / {trimestre.ano}{trimestre.tituloRevista ? ` — ${trimestre.tituloRevista}` : ''}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-admig" onClick={gerarRelatorio} disabled={!trimestreId || carregando}>
          <i className="bi bi-file-earmark-bar-graph me-1" />
          {carregando ? 'Gerando...' : 'Gerar relatório'}
        </button>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {relatorio && (
        <div className="relatorio-imprimivel">
          <div className="border-bottom pb-3 mb-3">
            <h4 className="font-principal text-brand-primary mb-1">
              {relatorio.trimestre.numero}º Trimestre / {relatorio.trimestre.ano}
            </h4>
            <div className="text-secondary">{relatorio.trimestre.tituloRevista}</div>
            <div className="small text-secondary">
              {formatarData(relatorio.trimestre.dataInicio)} a {formatarData(relatorio.trimestre.dataFim)}
            </div>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-12 col-sm-4"><div className="card card-admig p-3"><div className="small text-secondary">Presenças registradas</div><div className="fs-4 fw-bold text-success">{totalPresentes}</div></div></div>
            <div className="col-12 col-sm-4"><div className="card card-admig p-3"><div className="small text-secondary">Faltas registradas</div><div className="fs-4 fw-bold text-danger">{totalFaltas}</div></div></div>
            <div className="col-12 col-sm-4"><div className="card card-admig p-3"><div className="small text-secondary">Sem registro</div><div className="fs-4 fw-bold">{totalSemRegistro}</div></div></div>
          </div>

          {relatorio.classes.map((classe) => (
            <section className="mb-4" key={classe.classe.id}>
              <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 border-bottom pb-2 mb-2">
                <h5 className="mb-0">{NOMES_CLASSE[classe.classe.categoria].nome}</h5>
                <div className="small">
                  <span className="text-success me-3">Presenças: {classe.presentes}</span>
                  <span className="text-danger me-3">Faltas: {classe.faltas}</span>
                  <span className="text-secondary">Sem registro: {classe.semRegistro}</span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="sticky-start">Aluno</th>
                      <th>Pres.</th>
                      <th>Faltas</th>
                      <th>Sem reg.</th>
                      {relatorio.licoes.map((licao) => (
                        <th key={licao.id} className="text-center" title={licao.titulo || `Lição ${licao.numero}`}>
                          <span>L{licao.numero}</span>
                          <small className="d-block fw-normal">{formatarData(licao.data)}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classe.alunos.map((aluno) => (
                      <tr key={aluno.aluno.id}>
                        <th>{aluno.aluno.nome}</th>
                        <td className="text-success text-center">{aluno.presentes}</td>
                        <td className="text-danger text-center">{aluno.faltas}</td>
                        <td className="text-secondary text-center">{aluno.semRegistro}</td>
                        {aluno.estados.map((estado, index) => (
                          <td key={relatorio.licoes[index].id} className="text-center" title={formatarEstado(estado)}>
                            {estado === true ? <span className="badge badge-presente">P</span>
                              : estado === false ? <span className="badge badge-falta">F</span>
                              : <span className="text-secondary">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {classe.alunos.length === 0 && <tr><td colSpan={4 + relatorio.licoes.length} className="text-secondary">Nenhum aluno ativo nesta classe.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          <p className="small text-secondary mt-3">“-” significa que não há presença nem falta registrada para aquela lição.</p>
        </div>
      )}
    </div>
  );
}
