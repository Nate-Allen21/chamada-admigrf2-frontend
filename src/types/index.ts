export type Role = 'ADMINISTRADOR' | 'SECRETARIO';

export type CategoriaClasse = 'VARAO' | 'CRIANCA' | 'IRMA' | 'ADOLESCENTE' | 'JOVEM';

export const NOMES_CLASSE: Record<CategoriaClasse, { grupo: string; nome: string }> = {
  VARAO: { grupo: 'Varões', nome: 'Remidos de Deus' },
  CRIANCA: { grupo: 'Crianças', nome: 'Cordeirinhos de Cristo' },
  IRMA: { grupo: 'Irmãs', nome: 'Mensageiras de Cristo' },
  ADOLESCENTE: { grupo: 'Adolescentes', nome: 'Geração Eleita' },
  JOVEM: { grupo: 'Jovens', nome: 'Atalaias de Deus' },
};

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  telefone?: string;
  fotoUrl?: string;
  ativo?: boolean;
}

export interface Classe {
  id: number;
  categoria: CategoriaClasse;
  professorResponsavel?: string;
  ativo: boolean;
}

export interface Aluno {
  id: number;
  nome: string;
  dataNascimento?: string;
  responsavel?: string;
  telefoneContato?: string;
  classe: Classe;
  ativo: boolean;
}

export interface Trimestre {
  id: number;
  ano: number;
  numero: number;
  tituloRevista?: string;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
}

export interface Licao {
  id: number;
  numero: number;
  titulo?: string;
  data: string;
  trimestre?: Trimestre;
}

export interface Presenca {
  id: number;
  aluno: Aluno;
  licao: Licao;
  presente: boolean;
  observacao?: string;
}

export interface CalendarioResponse {
  trimestre: Trimestre | null;
  licoes: Licao[];
  licaoAtual: Licao | null;
  numeroLicaoAtual: number | null;
}
