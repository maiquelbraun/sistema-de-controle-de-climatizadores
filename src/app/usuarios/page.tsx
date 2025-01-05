'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid
} from '@mui/material'
import { useSnackbar } from 'notistack'
import { Spinner } from '@/components/Spinner'

// Definição de tipos
interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  password?: string
}

type UserRole = 'ADMIN' | 'USER' | 'OPERATOR' | 'TECNICO' | 'COMERCIAL' | 'GERENTE';

// Função para validar e corrigir o papel do usuário
const normalizeUserRole = (role?: string): UserRole => {
  const validRoles: UserRole[] = ['ADMIN', 'USER', 'OPERATOR', 'TECNICO', 'COMERCIAL', 'GERENTE'];
  const normalizedRole = role?.toUpperCase() as UserRole;
  
  console.log('Normalizando papel:', { 
    inputRole: role, 
    normalizedRole,
    isValid: validRoles.includes(normalizedRole)
  });

  return validRoles.includes(normalizedRole) 
    ? normalizedRole 
    : 'OPERATOR';
}

const userRoleOptions = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'USER', label: 'Usuário Padrão' },
  { value: 'OPERATOR', label: 'Operador' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'GERENTE', label: 'Gerente' },
];

export default function UsuariosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');

  // Log detalhado da sessão
  useEffect(() => {
    console.log('DEBUG: Detalhes completos da sessão:', {
      session: session,
      sessionExists: !!session,
      userRole: session?.user?.role,
      userId: session?.user?.id,
      userName: session?.user?.name,
      userEmail: session?.user?.email
    });

    // Redirecionar para login se não estiver autenticado
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [session, status, router])

  // Buscar usuários
  const fetchUsers = useCallback(async () => {
    try {
      console.log('DEBUG: Iniciando busca de usuários');
      console.log('DEBUG: Sessão atual:', {
        session: session,
        role: session?.user?.role,
        id: session?.user?.id
      });

      // Verificar se há sessão e se o usuário é admin
      if (!session || !session.user) {
        console.error('DEBUG: Sessão inválida ou inexistente', {
          session: session,
          user: session?.user
        });
        enqueueSnackbar('Sessão inválida. Faça login novamente.', { variant: 'error' });
        return;
      }

      if (session.user.role !== 'ADMIN') {
        console.error('DEBUG: Sem permissão para buscar usuários', {
          userRole: session.user.role
        });
        enqueueSnackbar('Acesso restrito. Somente administradores podem ver usuários.', { variant: 'error' });
        return;
      }

      const response = await fetch('/api/usuarios', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('DEBUG: Resposta da busca de usuários:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DEBUG: Erro na busca de usuários:', errorText);
        enqueueSnackbar('Erro ao buscar usuários', { variant: 'error' });
        return;
      }

      const data = await response.json();
      console.log('DEBUG: Dados de usuários recebidos:', data);
      
      // Verificar a estrutura da resposta
      if (data.users && Array.isArray(data.users)) {
        // Normalizar os dados dos usuários
        const normalizedUsers = data.users.map(user => ({
          ...user,
          role: normalizeUserRole(user.role),
          createdAt: new Date(user.createdAt).toLocaleString()
        }));

        setUsers(normalizedUsers);
      } else {
        console.error('DEBUG: Estrutura de dados inválida:', data);
        enqueueSnackbar('Formato de dados de usuários inválido', { variant: 'error' });
      }
    } catch (error) {
      console.error('DEBUG: Erro ao buscar usuários:', error);
      enqueueSnackbar('Erro ao carregar usuários', { variant: 'error' });
    }
  }, [enqueueSnackbar, session, normalizeUserRole]);

  // Carregar usuários ao montar o componente
  useEffect(() => {
    console.log('DEBUG: Efeito de carregamento de usuários');
    console.log('DEBUG: Sessão atual:', session);

    if (session?.user?.role === 'ADMIN') {
      console.log('DEBUG: Chamando fetchUsers');
      fetchUsers();
    } else {
      console.log('DEBUG: Não é admin, não carregando usuários', {
        role: session?.user?.role,
        sessionExists: !!session
      });
    }
  }, [session, fetchUsers]);

  // Função para abrir modal de edição
  const handleEditUser = (user: User) => {
    console.log('DEBUG: Abrindo modal de edição para usuário:', user);

    // Definir usuário selecionado
    setSelectedUser(user);
    
    // Inicializar campos de edição com valores do usuário
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);

    console.log('DEBUG: Estado de edição inicializado', {
      editName: user.name,
      editEmail: user.email,
      editRole: user.role
    });

    // Abrir modal
    setOpenDialog(true);
  };

  // Manipulador para salvar edições
  const handleSaveUser = async () => {
    console.log('DEBUG: handleSaveUser iniciado');
    console.log('DEBUG: Dados de edição:', {
      editName,
      editEmail,
      editRole,
      selectedUser: selectedUser
    });

    try {
      if (!selectedUser) {
        console.error('SAVE USER - Nenhum usuário selecionado para atualização');
        enqueueSnackbar('Nenhum usuário selecionado', { variant: 'error' });
        return;
      }

      // Verificar permissão de admin
      if (session?.user?.role !== 'ADMIN') {
        console.error('SAVE USER - Usuário não tem permissão de admin');
        enqueueSnackbar('Apenas administradores podem atualizar usuários', { variant: 'error' });
        return;
      }

      console.group('SAVE USER - Atualização de Usuário');
      console.log('SAVE USER - Usuário Selecionado:', selectedUser);

      // Preparar payload para atualização com os dados atualizados
      const updatePayload: any = {
        id: selectedUser.id,
        name: editName || selectedUser.name,
        email: editEmail || selectedUser.email,
        role: editRole || selectedUser.role
      }

      console.log('SAVE USER - Payload de Atualização:', updatePayload);

      // Verificar se todos os campos obrigatórios estão presentes
      const requiredFields = ['id', 'name', 'email', 'role'];
      const missingFields = requiredFields.filter(field => !updatePayload[field]);
      
      if (missingFields.length > 0) {
        console.error('SAVE USER - Campos obrigatórios ausentes:', missingFields);
        enqueueSnackbar(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`, { variant: 'error' });
        return;
      }

      // Adicionar tratamento de erro para fetch
      let response;
      try {
        console.log('SAVE USER - Iniciando requisição de atualização');
        console.log('SAVE USER - URL da requisição:', `/api/usuarios/${selectedUser.id}`);
        console.log('SAVE USER - Payload JSON:', JSON.stringify(updatePayload));

        response = await fetch(`/api/usuarios/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });
        console.log('SAVE USER - Requisição enviada');
      } catch (fetchError) {
        console.error('SAVE USER - Erro de conexão ao atualizar usuário:', fetchError);
        enqueueSnackbar('Erro de conexão ao atualizar usuário', { variant: 'error' });
        return;
      }

      // Comprehensive response logging
      console.log('SAVE USER - Resposta do Servidor - Status:', response.status);
      console.log('SAVE USER - Resposta do Servidor - Status Text:', response.statusText);

      // Check content type to determine how to handle the response
      const contentType = response.headers.get('content-type');
      console.log('SAVE USER - Tipo de Conteúdo:', contentType);

      let responseData;
      try {
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
          console.log('SAVE USER - Resposta JSON Parseada:', responseData);
        } else {
          const responseText = await response.text();
          console.error('SAVE USER - Resposta não-JSON recebida:', responseText);
          enqueueSnackbar(`Erro inesperado: ${responseText}`, { variant: 'error' });
          return;
        }
      } catch (parseError) {
        console.error('SAVE USER - Erro ao parsear resposta:', parseError);
        enqueueSnackbar('Erro ao processar resposta do servidor', { variant: 'error' });
        return;
      }

      console.groupEnd();

      if (response.ok) {
        // Validate the parsed user object
        if (responseData && responseData.data && responseData.data.id) {
          enqueueSnackbar('Usuário atualizado com sucesso', { variant: 'success' });
          
          // Update the users list with the updated user
          const updatedUsers = users.map(u => 
            u.id === responseData.data.id ? {
              ...responseData.data,
              createdAt: new Date(responseData.data.createdAt).toLocaleString()
            } : u
          );
          
          console.log('SAVE USER - Lista de usuários atualizada:', updatedUsers);
          setUsers(updatedUsers);
          
          // Fechar modal e limpar seleção
          setSelectedUser(null);
          setOpenDialog(false);
          
          // Resetar campos de edição
          setEditName('');
          setEditEmail('');
          setEditRole('');
        } else {
          console.error('SAVE USER - Resposta de usuário inválida:', responseData);
          enqueueSnackbar('Resposta inválida do servidor', { variant: 'error' });
        }
      } else {
        // Handle non-OK responses
        console.error('SAVE USER - Resposta de erro do servidor:', responseData);
        enqueueSnackbar(
          `Erro ao atualizar usuário: ${
            responseData?.message || 
            responseData?.error || 
            `Código de erro: ${response.status}`
          }`, 
          { variant: 'error' }
        );
      }
    } catch (error) {
      console.error('SAVE USER - Erro ao editar usuário:', error);
      enqueueSnackbar('Erro de conexão ao atualizar usuário', { variant: 'error' });
    }
  };

  // Modal de edição de usuário
  const EditUserModal = () => {
    // Estado local para o usuário em edição
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Efeito para inicializar o estado de edição quando o modal é aberto
    useEffect(() => {
      if (selectedUser) {
        // Criar uma cópia profunda do usuário selecionado
        const userCopy = { 
          ...selectedUser,
          // Garantir que o campo de senha seja opcional
          password: selectedUser.password || ''
        };
        console.log('Inicializando edição de usuário:', userCopy);
        setEditingUser(userCopy);
      }
    }, [selectedUser]);

    // Atualizar campo do usuário
    const handleUserFieldChange = (field: keyof User, value: string) => {
      console.log(`Alterando campo ${field}:`, value);
      setEditingUser(prev => {
        if (!prev) return null;
        const updatedUser = { ...prev, [field]: value };
        console.log('Usuário atualizado:', updatedUser);
        return updatedUser;
      });
    };

    // Fechar modal
    const handleClose = () => {
      console.log('Fechando modal de edição');
      setSelectedUser(null);
      setOpenDialog(false);
    };

    // Salvar usuário
    const handleSave = () => {
      console.log('Salvando usuário:', editingUser);
      if (editingUser) {
        // Atualizar o estado do usuário selecionado antes de salvar
        setSelectedUser(editingUser);
        
        // Chamar a função de salvar
        handleSaveUser();
      }
    };

    // Se não há usuário selecionado, não renderizar nada
    if (!editingUser) return null;

    return (
      <Dialog 
        open={!!selectedUser} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome"
                value={editName || editingUser.name}
                onChange={(e) => setEditName(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={editEmail || editingUser.email}
                onChange={(e) => setEditEmail(e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Senha (opcional)"
                type="password"
                value={editingUser.password || ''}
                onChange={(e) => handleUserFieldChange('password', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Papel</InputLabel>
                <Select
                  value={editRole || editingUser.role}
                  label="Papel"
                  onChange={(e) => setEditRole(e.target.value as string)}
                >
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                  <MenuItem value="USER">Usuário Padrão</MenuItem>
                  <MenuItem value="OPERATOR">Operador</MenuItem>
                  <MenuItem value="TECNICO">Técnico</MenuItem>
                  <MenuItem value="COMERCIAL">Comercial</MenuItem>
                  <MenuItem value="GERENTE">Gerente</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            color="primary" 
            variant="contained"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Renderização da tabela de usuários
  return (
    <div style={{ padding: '20px' }}>
      <h1>Gerenciamento de Usuários</h1>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Função</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => handleEditUser(user)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EditUserModal />
    </div>
  )
}
