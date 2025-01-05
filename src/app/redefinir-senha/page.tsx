'use client'

import { useState, useEffect } from 'react'
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert 
} from '@mui/material'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function RedefinirSenhaPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [tokenValido, setTokenValido] = useState(false)

  // Validar token ao carregar a página
  useEffect(() => {
    async function validarToken() {
      if (!token) {
        setMessage({
          type: 'error',
          text: 'Token de recuperação inválido ou ausente.'
        })
        return
      }

      try {
        const response = await fetch(`/api/validar-token-recuperacao?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setTokenValido(true)
        } else {
          setMessage({
            type: 'error',
            text: data.message || 'Token de recuperação inválido.'
          })
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Erro ao validar token. Tente novamente.'
        })
      }
    }

    validarToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (senha !== confirmacaoSenha) {
      setMessage({
        type: 'error',
        text: 'As senhas não coincidem.'
      })
      return
    }

    if (senha.length < 8) {
      setMessage({
        type: 'error',
        text: 'A senha deve ter no mínimo 8 caracteres.'
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token, 
          novaSenha: senha 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Senha redefinida com sucesso. Você será redirecionado para o login.'
        })

        // Redirecionar após 3 segundos
        setTimeout(() => {
          window.location.href = '/login'
        }, 3000)
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Erro ao redefinir senha'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro de conexão. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  // Se o token for inválido, mostrar mensagem de erro
  if (!tokenValido && message) {
    return (
      <Container maxWidth="xs">
        <Box 
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {message.text}
          </Alert>
          <Link href="/recuperar-senha" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary">
              Solicitar Novo Link
            </Button>
          </Link>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xs">
      <Box 
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Redefinir Senha
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="senha"
            label="Nova Senha"
            type="password"
            id="senha"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmacao-senha"
            label="Confirmar Nova Senha"
            type="password"
            id="confirmacao-senha"
            value={confirmacaoSenha}
            onChange={(e) => setConfirmacaoSenha(e.target.value)}
          />
          
          {message && (
            <Alert 
              severity={message.type} 
              sx={{ mt: 2, mb: 2 }}
            >
              {message.text}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !tokenValido}
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button variant="text" color="primary">
                Voltar para Login
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
