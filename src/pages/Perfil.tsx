import { ChangeEvent, FormEvent, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Perfil() {
  const { usuario, atualizarUsuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome || '');
  const [telefone, setTelefone] = useState(usuario?.telefone || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function handleFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !usuario) return;
    setEnviandoFoto(true);
    setErro('');
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      const { data } = await api.post('/upload/foto-perfil', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const atualizado = await api.put('/usuarios/perfil', { fotoUrl: data.url });
      atualizarUsuario({ ...usuario, fotoUrl: atualizado.data.fotoUrl });
      setMensagem('Foto atualizada!');
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao enviar a foto.');
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setSalvando(true);
    setErro('');
    setMensagem('');
    try {
      const { data } = await api.put('/usuarios/perfil', {
        nome,
        telefone,
        senhaAtual: senhaAtual || undefined,
        novaSenha: novaSenha || undefined,
      });
      atualizarUsuario({ ...usuario, nome: data.nome, telefone: data.telefone });
      setSenhaAtual('');
      setNovaSenha('');
      setMensagem('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Erro ao atualizar o perfil.');
    } finally {
      setSalvando(false);
    }
  }

  const fotoSrc = usuario?.fotoUrl
    ? (usuario.fotoUrl.startsWith('http') ? usuario.fotoUrl : `${import.meta.env.VITE_API_BASE || ''}${usuario.fotoUrl}`)
    : `https://ui-avatars.com/api/?background=0A5C98&color=fff&size=160&name=${encodeURIComponent(usuario?.nome || 'U')}`;

  return (
    <div>
      <h3 className="font-principal text-brand-primary mb-1">Meu Perfil</h3>
      <p className="text-secondary mb-4">Gerencie suas informações pessoais e foto de perfil.</p>

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card card-admig p-4 text-center">
            <img src={fotoSrc} alt="Foto de perfil" className="rounded-circle mx-auto mb-3" width={140} height={140} style={{ objectFit: 'cover' }} />
            <div className="fw-bold">{usuario?.nome}</div>
            <div className="text-secondary small mb-3">{usuario?.email}</div>
            <span className={`badge align-self-center mb-3 ${usuario?.role === 'ADMINISTRADOR' ? 'bg-brand-navy' : 'bg-brand-primary'}`}>
              {usuario?.role === 'ADMINISTRADOR' ? 'Administrador' : 'Secretário'}
            </span>
            <label className="btn btn-admig-outline mb-0">
              {enviandoFoto ? 'Enviando...' : 'Alterar foto'}
              <input type="file" accept="image/*" hidden onChange={handleFoto} disabled={enviandoFoto} />
            </label>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <form onSubmit={handleSubmit} className="card card-admig p-4">
            <h6 className="fw-bold mb-3">Dados pessoais</h6>
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Nome</label>
                <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Telefone</label>
                <input className="form-control" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
            </div>

            <h6 className="fw-bold mb-3 mt-2">Alterar senha</h6>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Senha atual</label>
                <input type="password" className="form-control" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Nova senha</label>
                <input type="password" className="form-control" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
              </div>
            </div>

            {mensagem && <div className="alert alert-success mt-3 py-2 mb-0">{mensagem}</div>}
            {erro && <div className="alert alert-danger mt-3 py-2 mb-0">{erro}</div>}

            <div className="mt-4">
              <button className="btn btn-admig" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
