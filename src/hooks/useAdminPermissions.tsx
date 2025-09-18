export function useAdminPermissions() {
  return {
    adminsWithPermissions: [],
    isLoading: false,
    togglePermission: () => {},
    isUpdating: false
  };
}

// Available permissions for physiotherapy context
export const AVAILABLE_PERMISSIONS = {
  manage_protocols: {
    label: 'Gerenciar Protocolos',
    description: 'Criar, editar e excluir protocolos terapêuticos',
    category: 'Terapia'
  },
  manage_exercises: {
    label: 'Gerenciar Exercícios',
    description: 'Criar, editar e excluir exercícios terapêuticos',
    category: 'Terapia'
  },
  manage_patients: {
    label: 'Gerenciar Pacientes',
    description: 'Visualizar e gerenciar dados dos pacientes',
    category: 'Pacientes'
  },
  manage_sessions: {
    label: 'Gerenciar Sessões',
    description: 'Agendar e gerenciar sessões de fisioterapia',
    category: 'Sessões'
  },
  view_analytics: {
    label: 'Ver Relatórios',
    description: 'Acessar relatórios de evolução dos pacientes',
    category: 'Relatórios'
  }
};