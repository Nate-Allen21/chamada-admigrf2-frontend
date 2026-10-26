import { useEffect, useState } from 'react';
import api from '../api/client';
import { Classe, NOMES_CLASSE } from '../types';

export default function Classes() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<Classe | null>(null);

  function carregar() {
    setCarregando(true);
    api.get<Classe[]>('/classes').then((r) => setClasses(r.data)).finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  async function salvarProfessor(classe: Classe, professor: string) {
    await api.put(`/classes/${classe.id}`, { ...classe, professorResponsavel: professor });
    setEditando(null);
    carregar();
  }

  return (
    <div>
      <h3 className="font-principal text-brand-primary mb-1">Classes</h3>
      <p className="text-secondary mb-4">
        As quatro classes da Escola Dominical são fixas, conforme o padrão da igreja. Aqui você pode
        definir o(a) professor(a) responsável por cada uma.
      </p>

      {carregando ? (
        <div className="text-secondary">Carregando...</div>
      ) : (
        <div className="row g-3">
          {classes.map((c) => (
            <div className="col-12 col-md-6" key={c.id}>
              <div className="card card-admig p-4 h-100">
                <span className={`badge badge-classe-${c.categoria} align-self-start mb-2`}>
                  {NOMES_CLASSE[c.categoria].grupo}
                </span>
                <div className="fs-5 fw-bold mb-2">{NOMES_CLASSE[c.categoria].nome}</div>

                {editando?.id === c.id ? (
                  <div className="d-flex gap-2">
                    <input
                      className="form-control"
                      defaultValue={c.professorResponsavel || ''}
                      id={`prof-${c.id}`}
                      placeholder="Nome do(a) professor(a)"
                    />
                    <button
                      className="btn btn-admig"
                      onClick={() => {
                        const input = document.getElementById(`prof-${c.id}`) as HTMLInputElement;
                        salvarProfessor(c, input.value);
                      }}
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      {c.professorResponsavel ? `Prof(a). ${c.professorResponsavel}` : 'Sem professor(a) definido(a)'}
                    </span>
                    <button className="btn btn-sm btn-admig-outline" onClick={() => setEditando(c)}>
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
