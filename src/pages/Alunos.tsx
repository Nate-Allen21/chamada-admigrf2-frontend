import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { Aluno, Classe, NOMES_CLASSE } from '../types';

export default function Alunos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const classeIdParam = searchParams.get('classeId');

  const [classes, setClasses] = useState<Classe[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [classeId, setClasseId] = useState<string>(classeIdParam || '');
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  useEffect(() => {
    api.get<Classe[]>('/classes').then((r) => setClasses(r.data));
  }, []);

  function carregarAlunos() {
    setCarregando(true);
    const url = classeId ? `/alunos?classeId=${classeId}` : '/alunos';
    api.get<Aluno[]>(url).then((r) => setAlunos(r.data)).finally(() => setCarregando(false));
  }

  useEffect(carregarAlunos, [classeId]);

  function selecionarClasse(id: string) {
    setClasseId(id);
    setSearchParams(id ? { classeId: id } : {});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!classeId) return;
    await api.post('/alunos', {
      nome,
      responsavel,
      telefoneContato: telefone,
      dataNascimento: dataNascimento || null,
      classe: { id: Number(classeId) },
      ativo: true,
    });
    setNome('');
    setResponsavel('');
    setTelefone('');
    setDataNascimento('');
    setMostrarForm(false);
    carregarAlunos();
  }

  async function excluir(id: number) {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    await api.delete(`/alunos/${id}`);
    carregarAlunos();
  }

  const classeSelecionada = classes.find((c) => c.id === Number(classeId));
  const mostrarResponsavel = classeSelecionada?.categoria === 'CRIANCA';
  const alunosOrdenados = [...alunos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h3 className="font-principal text-brand-primary mb-1">Alunos</h3>
          <p className="text-secondary mb-0">Cadastro de alunos por classe.</p>
        </div>
        <button className="btn btn-admig" onClick={() => setMostrarForm((v) => !v)}>
          <i className="bi bi-plus-lg me-1" /> Novo aluno
        </button>
      </div>

      <div className="mb-3" style={{ maxWidth: 320 }}>
        <select className="form-select" value={classeId} onChange={(e) => selecionarClasse(e.target.value)}>
          <option value="">Todas as classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {NOMES_CLASSE[c.categoria].grupo} — {NOMES_CLASSE[c.categoria].nome}
            </option>
          ))}
        </select>
      </div>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="card card-admig p-3 mb-4">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <label htmlFor="aluno-nome" className="form-label small fw-semibold">Nome completo</label>
              <input id="aluno-nome" className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="col-6 col-md-3">
              <label htmlFor="aluno-data-nascimento" className="form-label small fw-semibold">Data de nascimento</label>
              <input id="aluno-data-nascimento" type="date" className="form-control" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
            </div>
            {mostrarResponsavel && (
              <div className="col-6 col-md-3">
                <label htmlFor="aluno-responsavel" className="form-label small fw-semibold">Responsável</label>
                <input id="aluno-responsavel" className="form-control" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
              </div>
            )}
            <div className="col-6 col-md-2">
              <label htmlFor="aluno-telefone" className="form-label small fw-semibold">Telefone</label>
              <input id="aluno-telefone" className="form-control" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
          </div>
          {!classeId && <div className="text-danger small mt-2">Selecione uma classe acima antes de cadastrar.</div>}
          <div className="mt-3">
            <button className="btn btn-admig" disabled={!classeId}>Salvar aluno</button>
          </div>
        </form>
      )}

      {carregando ? (
        <div className="text-secondary">Carregando...</div>
      ) : (
        <div className="card card-admig p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Classe</th>
                  <th>Contato</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunosOrdenados.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nome}</td>
                    <td>
                      <span className={`badge badge-classe-${a.classe.categoria}`}>
                        {NOMES_CLASSE[a.classe.categoria].grupo}
                      </span>
                    </td>
                    <td className="text-secondary small">
                      {a.responsavel && <div>Resp: {a.responsavel}</div>}
                      {a.telefoneContato && <div>{a.telefoneContato}</div>}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(a.id)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
                {alunos.length === 0 && (
                  <tr><td colSpan={4} className="text-center text-secondary py-4">Nenhum aluno encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
