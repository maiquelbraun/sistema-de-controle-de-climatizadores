'use client'

import React, { useState } from 'react'
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material'

interface CriarUsuarioModalProps {
  open: boolean
  onClose: () => void
  onUserCreated: (user: any) => void
}

export function CriarUsuarioModal({ 
  open, 
  onClose, 
  onUserCreated 
}: CriarUsuarioModalProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState('OPERATOR')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const roles = [
    'ADMIN', 
    'MANAGER', 
    'TECHNICIAN', 
    'OPERATOR', 
    'VIEWER'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validações básicas
    if (!nome || !email || !senha) {
      setError('Todos os campos são obrigatórios')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nome,
          email,
          password: senha,
          role
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || 'Erro ao criar usuário')
      }

      // Limpar formulário
      setNome('')
      setEmail('')
      setSenha('')
      setRole('OPERATOR')

      // Chamar callback de criação de usuário com dados do usuário criado
      onUserCreated(responseData.user)

      // Fechar modal
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="criar-usuario-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box 
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}
      >
        <Typography 
          id="criar-usuario-modal-title" 
          variant="h6" 
          component="h2" 
          sx={{ mb: 2 }}
        >
          Criar Novo Usuário
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Papel</InputLabel>
            <Select
              value={role}
              label="Papel"
              onChange={(e) => setRole(e.target.value)}
            >
              {roles.map((roleOption) => (
                <MenuItem key={roleOption} value={roleOption}>
                  {roleOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              onClick={onClose} 
              color="secondary"
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  )
}
