export interface Climatizador {
  id: number
  modelo: string
  marca: string
  localizacao: string
  dataInstalacao: Date | null
  ultimaManutencao?: Date | null
  proximaManutencao?: Date | null
  status: 'Ativo' | 'Inativo' | 'Manutenção'
  numeroSerie?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface Manutencao {
  id: number
  climatizadorId: number
  dataManutencao: Date
  tipo: string
  descricao: string
  tecnico: string
  custo: number
  createdAt?: Date
  updatedAt?: Date
}

export interface DashboardStats {
  total: number;
  ativos: number;
  manutencaoNecessaria: number;
  manutencaoEmDia: number;
  loading: boolean;
}

export interface ApiResponse<T> {
  data: T | null
  message: string
}
