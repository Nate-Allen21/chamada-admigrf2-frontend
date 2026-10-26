import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { CalendarioResponse, Classe, NOMES_CLASSE } from '../types';

export default function Dashboard() {
  const [calendario, setCalendario] = useState<CalendarioResponse | null>(null);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<CalendarioResponse>('/trimestres/calendario'),
      api.get<Classe[]>('/classes'),
    ])
      .then(([cal, cls]) => {
        setCalendario(cal.data);
        setClasses(cls.data);
      })
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div>
      <h3 className="font-principal text-brand-primary mb-1">Painel da Escola Dominical</h3>
      <p className="text-secondary mb-4">Este é o painel geral da Escola Dominical - ADMIG RF II.</p>

      {carregando ? (
        <div className="text-secondary">Carregando...</div>
      ) : (
        <>
          <div className="card card-admig p-4 mb-4">
            {calendario?.trimestre ? (
              <>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div>
                    <div className="text-secondary small text-uppercase fw-semibold">Trimestre atual</div>
                    <div className="fs-5 fw-bold">
                      {calendario.trimestre.numero}º Trimestre / {calendario.trimestre.ano}
                      {calendario.trimestre.tituloRevista ? ` — ${calendario.trimestre.tituloRevista}` : ''}
                    </div>
                  </div>
                  <Link to="/calendario" className="btn btn-admig-outline btn-sm">Ver calendário completo</Link>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {calendario.licoes.map((l) => {
                    const status = calendario.numeroLicaoAtual
                      ? l.numero < calendario.numeroLicaoAtual
                        ? 'passada'
                        : l.numero === calendario.numeroLicaoAtual
                        ? 'atual'
                        : 'futura'
                      : 'futura';
                    return (
                      <div key={l.id} className={`licao-pill ${status}`} title={`Lição ${l.numero} - ${l.data}`}>
                        {l.numero}
                      </div>
                    );
                  })}
                </div>
                {calendario.licaoAtual && (
                  <div className="mt-3 alert alert-info mb-0">
                    Estamos na <strong>Lição {calendario.numeroLicaoAtual}</strong> de 13
                    {calendario.licaoAtual.titulo ? `: ${calendario.licaoAtual.titulo}` : ''}.
                  </div>
                )}
              </>
            ) : (
              <div className="text-secondary">
                Nenhum trimestre cadastrado ainda para a data de hoje.{' '}
                <Link to="/calendario">Cadastre o trimestre atual</Link> para começar a chamada.
              </div>
            )}
          </div>

          <div className="row g-3">
            {classes.map((c) => (
              <div className="col-12 col-sm-6 col-lg-3" key={c.id}>
                <div className="card card-admig p-3 h-100">
                  <span className={`badge badge-classe-${c.categoria} align-self-start mb-2`}>
                    {NOMES_CLASSE[c.categoria].grupo}
                  </span>
                  <div className="fw-bold">{NOMES_CLASSE[c.categoria].nome}</div>
                  {c.professorResponsavel && (
                    <div className="text-secondary small mt-1">Prof(a). {c.professorResponsavel}</div>
                  )}
                  <Link to={`/alunos?classeId=${c.id}`} className="small mt-2">
                    Ver alunos <i className="bi bi-arrow-right" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Link to="/chamada" className="btn btn-admig-gold">
              <i className="bi bi-clipboard-check me-2" />
              Fazer chamada de hoje
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
