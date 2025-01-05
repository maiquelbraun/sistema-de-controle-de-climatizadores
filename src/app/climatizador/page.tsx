'use client'

import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  IconButton, 
  Box 
} from '@mui/material'
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Visibility as VisibilityIcon 
} from '@mui/icons-material'
import Link from 'next/link'
import { format } from 'date-fns'

interface Climatizador {
  id: number
  modelo: string
  marca: string
  localizacao: string
  dataInstalacao: string | Date
  status: string
}

export default function ClimatizadoresList() {
  const [climatizadores, setClimatizadores] = useState<Climatizador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClimatizadores = async () => {
      try {
        console.log('Iniciando busca de climatizadores...')
        const response = await fetch('/api/climatizadores', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
        
        console.log('Resposta recebida:', response)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Erro na resposta:', errorText)
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`)
        }

        console.log('Tentando obter JSON da resposta...')
        const responseData = await response.json()
        console.log('Dados recebidos:', responseData)
        
        // Validate response structure
        if (!responseData || typeof responseData !== 'object') {
          throw new Error('Resposta inválida: não é um objeto')
        }
        
        // Ensure we always have an array
        const climatizadores = Array.isArray(responseData.data) 
          ? responseData.data 
          : (responseData.data ? [responseData.data] : [])
        
        console.log('Climatizadores mapeados:', climatizadores)
        
        setClimatizadores(climatizadores)
        setLoading(false)
      } catch (err) {
        console.error('Erro detalhado na busca:', err)
        
        const errorMessage = err instanceof Error 
          ? `Erro ao buscar climatizadores: ${err.name} - ${err.message}\n${err.stack || ''}`
          : 'Erro desconhecido'
        
        console.error('Mensagem de erro final:', errorMessage)
        setError(errorMessage)
        setLoading(false)
      }
    }

    fetchClimatizadores()
  }, [])

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este climatizador?')) {
      try {
        const response = await fetch(`/api/climatizadores?id=${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Falha ao excluir climatizador')
        }

        setClimatizadores(climatizadores.filter(c => c.id !== id))
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir')
      }
    }
  }

  if (loading) return <Typography>Carregando...</Typography>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Climatizadores
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Link href="/climatizador/novo">
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
          >
            Novo Climatizador
          </Button>
        </Link>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Data de Instalação</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {climatizadores.map((climatizador) => (
              <TableRow key={climatizador.id}>
                <TableCell>{climatizador.id}</TableCell>
                <TableCell>{climatizador.modelo}</TableCell>
                <TableCell>{climatizador.marca}</TableCell>
                <TableCell>{climatizador.localizacao}</TableCell>
                <TableCell>
                  {climatizador.dataInstalacao 
                    ? format(new Date(climatizador.dataInstalacao), 'dd/MM/yyyy')
                    : 'Não disponível'}
                </TableCell>
                <TableCell>{climatizador.status}</TableCell>
                <TableCell align="right">
                  <Link href={`/climatizador/${climatizador.id}`}>
                    <IconButton color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Link>
                  <Link href={`/climatizador/editar/${climatizador.id}`}>
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(climatizador.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
