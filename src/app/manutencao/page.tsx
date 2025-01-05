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
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Visibility as VisibilityIcon 
} from '@mui/icons-material'
import Link from 'next/link'
import { format } from 'date-fns'

interface Manutencao {
  id: number
  climatizadorId: number
  dataManutencao: string
  tipo: string
  descricao: string
  tecnico: string
  custo: number
  climatizador?: {
    modelo: string
    marca: string
    localizacao: string
  }
}

export default function ManutencoesList() {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [manutencaoToDelete, setManutencaoToDelete] = useState<number | null>(null)

  useEffect(() => {
    const fetchManutencoes = async () => {
      try {
        const response = await fetch('/api/manutencoes', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        })

        console.log('Resposta recebida:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        // Verificar status da resposta
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Erro na resposta:', errorText)
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`)
        }

        // Log do conteúdo bruto da resposta
        const responseText = await response.text()
        console.log('Conteúdo da resposta:', responseText)
        
        // Parsear o texto da resposta manualmente
        let result
        try {
          // Tentar parsear mesmo se houver problemas
          result = JSON.parse(responseText)
          console.log('Resultado do parse:', result)
        } catch (parseError) {
          console.error('Erro ao parsear JSON:', parseError)
          console.error('Conteúdo que falhou no parse:', responseText)
          throw new Error(`Resposta inválida do servidor: ${parseError.message}`)
        }
        
        console.log('Dados de manutenções parseados:', result)
        
        // Verificar se a resposta tem dados
        if (!result || (!result.data && !Array.isArray(result))) {
          console.warn('Nenhuma manutenção encontrada', result)
          setManutencoes([])
          setLoading(false)
          return
        }
        
        // Ajustar para usar o novo formato de resposta
        setManutencoes(result.data || result || [])
        setLoading(false)
      } catch (err) {
        console.error('Erro completo na busca de manutenções:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setLoading(false)
      }
    }

    fetchManutencoes()
  }, [])

  const handleDeleteConfirmOpen = (id: number) => {
    setManutencaoToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false)
    setManutencaoToDelete(null)
  }

  const handleDelete = async () => {
    if (manutencaoToDelete) {
      try {
        const response = await fetch(`/api/manutencoes?id=${manutencaoToDelete}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Falha ao excluir manutenção')
        }

        setManutencoes(manutencoes.filter(m => m.id !== manutencaoToDelete))
        handleDeleteConfirmClose()
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
        Histórico de Manutenções
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Link href="/manutencao/novo" passHref>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
          >
            Nova Manutenção
          </Button>
        </Link>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Climatizador</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Técnico</TableCell>
              <TableCell>Custo</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manutencoes.map((manutencao) => (
              <TableRow key={manutencao.id}>
                <TableCell>{manutencao.id}</TableCell>
                <TableCell>
                  {manutencao.climatizador 
                    ? `${manutencao.climatizador.modelo} (${manutencao.climatizador.marca})`
                    : 'Climatizador não identificado'}
                </TableCell>
                <TableCell>
                  {manutencao.dataManutencao ? format(new Date(manutencao.dataManutencao), 'dd/MM/yyyy') : 'Data não disponível'}
                </TableCell>
                <TableCell>{manutencao.tipo}</TableCell>
                <TableCell>{manutencao.tecnico}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(manutencao.custo)}
                </TableCell>
                <TableCell align="right">
                  <Link href={`/manutencao/${manutencao.id}`} passHref>
                    <IconButton color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Link>
                  <Link href={`/manutencao/editar/${manutencao.id}`} passHref>
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteConfirmOpen(manutencao.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: 'background.paper',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }
        }}
      >
        <DialogTitle 
          id="alert-dialog-title" 
          sx={{ 
            fontWeight: 600, 
            color: 'error.main', 
            textAlign: 'center' 
          }}
        >
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="alert-dialog-description"
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              mb: 2 
            }}
          >
            Tem certeza que deseja excluir este registro de manutenção? 
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions 
          sx={{ 
            justifyContent: 'center', 
            pb: 3, 
            px: 3 
          }}
        >
          <Button 
            onClick={handleDeleteConfirmClose} 
            variant="outlined" 
            color="primary"
            sx={{ mr: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error" 
            autoFocus
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
