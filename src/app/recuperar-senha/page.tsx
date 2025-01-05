'use client'

import { useState } from 'react'
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert 
} from '@mui/material'
import Link from 'next/link'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/recuperar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Um link de recuperação de senha foi enviado para seu email.'
        })
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Erro ao enviar link de recuperação'
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
          Recuperar Senha
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
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
