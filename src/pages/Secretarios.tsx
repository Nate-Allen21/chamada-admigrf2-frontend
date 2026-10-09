import { FormEvent, useEffect, useState } from 'react';
import api from '../api/client';
import { Usuario } from '../types';

export default function Secretarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function carregar() {
    setCarregando(true);
    api.get<Usuario[]>('/usuarios').then((r) => setUsuarios(r.data)).finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/usuarios', { nome, email, senha, role: 'SECRETARIO' });
      setNome('');
      setEmail('');
      setSenha('');
      setMostrarForm(false);
      carregar();
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao criar secretário.');
    }
  }

  async function desativar(id: number) {
    if (!confirm('Desativar este secretário? Ele não poderá mais acessar o sistema.')) return;
    await api.patch(`/usuarios/${id}/desativar`);
    carregar();
  }

  async function excluir(id: number) {
    if (!confirm('Excluir permanentemente este perfil de secretário?')) return;
    await api.delete(`/usuarios/${id}`);
    carregar();
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h3 className="font-principal text-brand-primary mb-1">Secretários</h3>
          <p className="text-secondary mb-0">Gerencie os perfis de secretário(a) que podem acessar o sistema.</p>
        </div>
        <button className="btn btn-admig" onClick={() => setMostrarForm((v) => !v)}>
          <i className="bi bi-plus-lg me-1" /> Novo secretário
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="card card-admig p-3 mb-4">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Nome</label>
              <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">E-mail</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Senha provisória</label>
              <input type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>
          </div>
          {erro && <div className="alert alert-danger py-2 mt-3 mb-0">{erro}</div>}
          <div className="mt-3">
            <button className="btn btn-admig">Criar acesso de secretário(a)</button>
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
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'ADMINISTRADOR' ? 'bg-brand-navy' : 'bg-brand-primary'}`}>
                        {u.role === 'ADMINISTRADOR' ? 'Administrador' : 'Secretário'}
                      </span>
                    </td>
                    <td>
                      {u.ativo ? <span className="badge badge-presente">Ativo</span> : <span className="badge badge-falta">Inativo</span>}
                    </td>
                    <td className="text-end">
                      {u.role !== 'ADMINISTRADOR' && (
                        <>
                          <button className="btn btn-sm btn-admig-outline me-2" onClick={() => desativar(u.id)}>Desativar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(u.id)}>
                            <i className="bi bi-trash" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
