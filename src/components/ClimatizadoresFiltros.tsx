'use client'

import React, { useState } from 'react'
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  Grid 
} from '@mui/material'

interface FiltrosClimatizadoresProps {
  onFiltrar: (filtros: {
    status?: string
    marca?: string
    localizacao?: string
    proximaManutencaoInicio?: Date
    proximaManutencaoFim?: Date
  }) => void
}

export default function ClimatizadoresFiltros({ onFiltrar }: FiltrosClimatizadoresProps) {
  const [status, setStatus] = useState('')
  const [marca, setMarca] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [proximaManutencaoInicio, setProximaManutencaoInicio] = useState<Date | null>(null)
  const [proximaManutencaoFim, setProximaManutencaoFim] = useState<Date | null>(null)

  // Opções de filtro baseadas nos dados existentes
  const statusOptions = ['Ativo', 'Inativo', 'Manutenção']
  const marcaOptions = ['LG', 'Consul', 'Samsung', 'Midea']
  const localizacaoOptions = [
    'Escritório Principal', 
    'Sala de Reuniões', 
    'Recepção', 
    'Almoxarifado'
  ]

  const handleFiltrar = () => {
    onFiltrar({
      status: status || undefined,
      marca: marca || undefined,
      localizacao: localizacao || undefined,
      proximaManutencaoInicio: proximaManutencaoInicio || undefined,
      proximaManutencaoFim: proximaManutencaoFim || undefined
    })
  }

  const handleLimpar = () => {
    setStatus('')
    setMarca('')
    setLocalizacao('')
    setProximaManutencaoInicio(null)
    setProximaManutencaoFim(null)
    onFiltrar({})
  }

  return (
    <Box sx={{ 
      backgroundColor: 'background.paper', 
      p: 2, 
      borderRadius: 2,
      mb: 2
    }}>
      <Typography variant="h6" gutterBottom>
        Filtros de Climatizadores
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Marca</InputLabel>
            <Select
              value={marca}
              label="Marca"
              onChange={(e) => setMarca(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {marcaOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Localização</InputLabel>
            <Select
              value={localizacao}
              label="Localização"
              onChange={(e) => setLocalizacao(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {localizacaoOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Próxima Manutenção (Início)"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={proximaManutencaoInicio ? proximaManutencaoInicio.toISOString().split('T')[0] : ''}
            onChange={(e) => setProximaManutencaoInicio(new Date(e.target.value))}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Próxima Manutenção (Fim)"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={proximaManutencaoFim ? proximaManutencaoFim.toISOString().split('T')[0] : ''}
            onChange={(e) => setProximaManutencaoFim(new Date(e.target.value))}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2 
          }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleLimpar}
            >
              Limpar Filtros
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleFiltrar}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
