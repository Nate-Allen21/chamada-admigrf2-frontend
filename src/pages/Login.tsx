import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Não foi possível entrar. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-split">
      <div className="login-form-side p-4">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <img src="/admig-logo.svg" alt="ADMIG Riacho Fundo" className="login-logo mb-4" />
          <h2 className="font-principal text-brand-primary mb-1">Bem-vindo(a)</h2>
          <p className="text-secondary mb-4">Entre com sua conta para acessar a chamada.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label fw-semibold">E-mail</label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@admig.org"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="login-senha" className="form-label fw-semibold">Senha</label>
              <input
                id="login-senha"
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {erro && <div className="alert alert-danger py-2" role="alert">{erro}</div>}
            <button className="btn btn-admig w-100 mt-2" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
      <div className="login-brand-side">
        <img src="/admig-logo.svg" alt="ADMIG Riacho Fundo" className="login-brand-logo mb-3" />
        <div className="fs-5 text-center">Sistema de Chamada<br/>Escola Dominical</div>
        <hr className="w-50 my-4" style={{ borderColor: 'rgba(255,255,255,0.4)' }} />
        <div className="text-center small" style={{ maxWidth: 320 }}>
          Varões · Crianças · Irmãs · Adolescentes
        </div>
      </div>
    </div>
  );
}
