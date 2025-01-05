'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  CircularProgress,
  TablePagination
} from '@mui/material'
import ClimatizadoresFiltros from './ClimatizadoresFiltros'
import { format } from 'date-fns'

interface Climatizador {
  id: number
  modelo: string
  marca: string
  localizacao: string
  status: string
  proximaManutencao: string
  numeroSerie: string
}

export default function ListaClimatizadores() {
  const [climatizadores, setClimatizadores] = useState<Climatizador[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({})
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    totalPaginas: 0,
    totalRegistros: 0
  })

  const fetchClimatizadores = async (filtrosParam = {}, page = 0) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      // Adicionar filtros
      Object.entries(filtrosParam).forEach(([key, value]) => {
        if (value) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString())
          } else {
            queryParams.append(key, value as string)
          }
        }
      })

      const response = await fetch(`/api/climatizadores`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar climatizadores')
      }

      const data = await response.json()
      setClimatizadores(data)
      setPagination(prev => ({
        ...prev,
        page,
        totalPaginas: 1,
        totalRegistros: data.length
      }))
    } catch (error) {
      console.error('Erro:', error)
      setClimatizadores([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClimatizadores()
  }, [])

  const handleFiltrar = (novosFiltros: any) => {
    setFiltros(novosFiltros)
    fetchClimatizadores(novosFiltros)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    // Remover lógica de paginação por enquanto
    return
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Remover lógica de paginação por enquanto
    return
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Ativo': return 'success'
      case 'Manutenção': return 'warning'
      case 'Inativo': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <ClimatizadoresFiltros onFiltrar={handleFiltrar} />
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número de Série</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Próxima Manutenção</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : climatizadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum climatizador encontrado
                </TableCell>
              </TableRow>
            ) : (
              climatizadores.map((climatizador) => (
                <TableRow key={climatizador.id}>
                  <TableCell>{climatizador.numeroSerie}</TableCell>
                  <TableCell>{climatizador.modelo}</TableCell>
                  <TableCell>{climatizador.marca}</TableCell>
                  <TableCell>{climatizador.localizacao}</TableCell>
                  <TableCell>
                    <Chip 
                      label={climatizador.status} 
                      color={getStatusColor(climatizador.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {climatizador.proximaManutencao 
                      ? format(new Date(climatizador.proximaManutencao), 'dd/MM/yyyy') 
                      : 'Não definida'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.totalRegistros}
          rowsPerPage={pagination.limit}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count}`
          }
        />
      </TableContainer>
    </Box>
  )
}
