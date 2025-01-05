const API_BASE = '/api';

export async function getClimatizadores() {
  const response = await fetch(`${API_BASE}/climatizadores`);
  if (!response.ok) throw new Error('Failed to fetch climatizadores');
  const result = await response.json();
  
  // Return the data array, which might be nested
  return result.data || result.climatizadores || result || [];
}

export async function getClimatizador(id: number) {
  const response = await fetch(`${API_BASE}/climatizadores/${id}`);
  if (!response.ok) throw new Error('Failed to fetch climatizador');
  return response.json();
}

export async function createClimatizador(data: any) {
  const response = await fetch(`${API_BASE}/climatizadores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create climatizador');
  return response.json();
}

export async function updateClimatizador(id: number, data: any) {
  const response = await fetch(`${API_BASE}/climatizadores/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update climatizador');
  return response.json();
}

export async function deleteClimatizador(id: number) {
  const response = await fetch(`${API_BASE}/climatizadores/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete climatizador');
  return response.ok;
}

export async function getManutencoes(id: number) {
  const response = await fetch(`${API_BASE}/climatizadores/${id}/manutencoes`);
  if (!response.ok) throw new Error('Failed to fetch manutencoes');
  return response.json();
}

export async function createManutencao(data: any) {
  const response = await fetch(`${API_BASE}/manutencoes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // Adicionar log de erro detalhado
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Erro na criação de manutenção:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody
    });
    throw new Error(`Falha ao criar manutenção: ${errorBody}`);
  }

  return response.json();
}

export async function updateManutencao(id: number, data: any) {
  console.log('Atualizando manutenção:', { id, data })
  
  const response = await fetch(`/api/manutencoes`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, ...data }),
  });

  console.log('Resposta da atualização:', {
    status: response.status,
    statusText: response.statusText
  })

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Erro ao atualizar manutenção:', {
      status: response.status,
      statusText: response.statusText,
      body: errorBody
    });
    throw new Error(`Falha ao atualizar manutenção: ${errorBody}`);
  }

  return response.json();
}

export async function getManutencaoById(id: number) {
  try {
    console.log('Buscando detalhes da manutenção:', id)
    
    const response = await fetch(`/api/manutencoes?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Resposta da API:', {
      status: response.status,
      statusText: response.statusText
    })
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Erro detalhado ao buscar manutenção:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      throw new Error(`Falha ao buscar detalhes da manutenção: ${errorBody}`);
    }

    const data = await response.json();
    console.log('Dados da manutenção recebidos:', data)

    // Verificar se todos os campos importantes estão presentes
    const camposEsperados = [
      'id', 
      'climatizadorId', 
      'dataManutencao', 
      'tipo', 
      'descricao', 
      'tecnico', 
      'custo'
    ];

    const camposFaltantes = camposEsperados.filter(campo => !(campo in data));
    
    if (camposFaltantes.length > 0) {
      console.warn('Campos faltantes:', camposFaltantes);
    }

    return {
      id: data.id,
      climatizadorId: data.climatizadorId,
      dataManutencao: data.dataManutencao,
      tipo: data.tipo,
      descricao: data.descricao || '',
      tecnico: data.tecnico || '',
      custo: data.custo || 0,
      climatizador: data.climatizador || {}
    };
  } catch (error) {
    console.error('Erro na função getManutencaoById:', error)
    throw error;
  }
}
