'use client'

import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper
} from '@mui/material'
import { 
  DatePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import ptBR from 'date-fns/locale/pt-BR'
import { format, parseISO } from 'date-fns'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import ExcelJS from 'exceljs'

// Importações locais
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { 
  DocumentReportIcon, 
  ListIcon, 
  SearchIcon, 
  FileExcelIcon, 
  FilePdfIcon, 
  AlertCircleIcon 
} from '@/components/Icons'

interface Climatizador {
  id: number
  modelo: string
  marca: string
  localizacao: string
  data_instalacao: string
  ultimaManutencao: string | null
  status: string
}

interface Manutencao {
  id: number
  climatizador_id: number
  data_manutencao: string
  tipo: string
  descricao: string
  tecnico: string
  custo: number
  climatizador: {
    modelo: string
    marca: string
  }
}

const reportTypeToUrl = {
  climatizadores: '/api/climatizadores',
  manutencoes: '/api/manutencoes'
}

export default function Relatorios() {
  const [reportType, setReportType] = useState<'climatizadores' | 'manutencoes'>('climatizadores')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [reportData, setReportData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = reportTypeToUrl[reportType]
      console.log('URL do relatório:', url)

      // Adicionar parâmetros de data se existirem
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate.toISOString())
      if (endDate) params.append('endDate', endDate.toISOString())

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      console.log('Resposta recebida:', {
        status: response.status,
        statusText: response.statusText
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro na resposta:', errorText)
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`)
      }
      
      const responseData = await response.json()
      console.log('Dados do relatório:', responseData)
      
      // Validar estrutura da resposta
      const data = responseData.data || responseData
      
      // Garantir que seja sempre um array
      const processedData = Array.isArray(data) 
        ? data 
        : [data]
      
      console.log('Dados parseados:', processedData)
      
      if (processedData.length === 0) {
        throw new Error('Nenhum dado encontrado para o relatório')
      }
      
      setReportData(processedData)
      setLoading(false)
    } catch (error) {
      console.error('Erro na busca de relatório:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      setLoading(false)
    }
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');
    
    // Adicione cabeçalhos
    const headers = Object.keys(reportData[0] || {});
    worksheet.addRow(headers);
    
    // Adicione dados
    reportData.forEach(item => {
      worksheet.addRow(Object.values(item));
    });
    
    const fileName = `relatorio_${reportType}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
    await workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    });
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Título do relatório
    doc.setFontSize(18)
    doc.text(`Relatório de ${reportType === 'climatizadores' ? 'Climatizadores' : 'Manutenções'}`, 14, 22)

    // Adicionar dados à tabela
    const headers = Object.keys(reportData[0] || {})
    const data = reportData.map(item => Object.values(item))

    // @ts-ignore
    doc.autoTable({
      startY: 30,
      head: [headers],
      body: data
    })

    const fileName = `relatorio_${reportType}_${format(new Date(), 'yyyyMMdd')}.pdf`
    doc.save(fileName)
  }

  // Buscar dados ao alterar o tipo de relatório
  useEffect(() => {
    fetchReportData()
  }, [reportType])

  const renderReportTable = () => {
    console.log('Dados do relatório:', reportData)
    
    if (reportType === 'manutencoes') {
      const manutencoes = reportData as Manutencao[]
      console.log('Manutenções:', manutencoes)
      
      // Verificação adicional de dados
      if (!manutencoes || !Array.isArray(manutencoes) || manutencoes.length === 0) {
        return (
          <Typography color="error">
            Nenhuma manutenção encontrada
          </Typography>
        )
      }
      
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Climatizador</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Técnico</TableCell>
                <TableCell>Custo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {manutencoes.map((manutencao) => {
                console.log('Renderizando manutenção:', manutencao)
                
                // Verificação de campos obrigatórios
                if (!manutencao) {
                  console.warn('Manutenção inválida:', manutencao)
                  return null
                }
                
                return (
                  <TableRow key={manutencao.id}>
                    <TableCell>{manutencao.id}</TableCell>
                    <TableCell>
                      {manutencao.climatizador?.modelo || manutencao.modelo || 'Modelo não informado'} 
                      {(manutencao.climatizador?.marca || manutencao.marca) 
                        ? ` (${manutencao.climatizador?.marca || manutencao.marca})` 
                        : ''}
                    </TableCell>
                    <TableCell>
                      {formatDate(manutencao.dataManutencao || manutencao.data_manutencao)}
                    </TableCell>
                    <TableCell>{manutencao.tipo || manutencao.tipoManutencao || 'Tipo não informado'}</TableCell>
                    <TableCell>{manutencao.descricao || 'Sem descrição'}</TableCell>
                    <TableCell>{manutencao.tecnico || manutencao.tecnicoResponsavel || 'Técnico não informado'}</TableCell>
                    <TableCell>
                      {manutencao.custo !== undefined
                        ? new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(manutencao.custo)
                        : 'Custo não informado'}
                    </TableCell>
                  </TableRow>
                )
              }).filter(Boolean)}
            </TableBody>
          </Table>
        </TableContainer>
      )
    } else {
      const climatizadores = reportData as Climatizador[]
      console.log('Climatizadores:', climatizadores)
      
      // Verificação adicional de dados
      if (!climatizadores || !Array.isArray(climatizadores) || climatizadores.length === 0) {
        return (
          <Typography color="error">
            Nenhum climatizador encontrado
          </Typography>
        )
      }
      
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Data de Instalação</TableCell>
                <TableCell>Última Manutenção</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {climatizadores.map((climatizador) => {
                console.log('Renderizando climatizador:', climatizador)
                
                return (
                  <TableRow key={climatizador.id}>
                    <TableCell>{climatizador.id}</TableCell>
                    <TableCell>{climatizador.modelo || 'Não informado'}</TableCell>
                    <TableCell>{climatizador.marca || 'Não informada'}</TableCell>
                    <TableCell>{climatizador.localizacao || 'Não informada'}</TableCell>
                    <TableCell>
                      {climatizador.data_instalacao || climatizador.dataInstalacao
                        ? formatDate(new Date(climatizador.data_instalacao || climatizador.dataInstalacao)) 
                        : 'Não informada'}
                    </TableCell>
                    <TableCell>
                      {climatizador.ultimaManutencao 
                        ? formatDate(new Date(climatizador.ultimaManutencao)) 
                        : 'Sem manutenção'}
                    </TableCell>
                    <TableCell>{climatizador.status || 'Não definido'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const parsedDate = parseISO(dateString)
      
      // Verificar se a data é válida
      if (isNaN(parsedDate.getTime())) {
        return 'Data inválida'
      }
      
      return format(parsedDate, 'dd/MM/yyyy')
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error)
      return 'Data inválida'
    }
  }

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Cabeçalho do Relatório */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <DocumentReportIcon className="w-10 h-10 mr-4 text-white" />
              Gerador de Relatórios
            </h1>
            <p className="text-blue-100 mt-2">
              Gere relatórios personalizados para análise de climatizadores e manutenções
            </p>
          </div>

          {/* Filtros e Controles */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo de Relatório */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Relatório
                </label>
                <Select
                  fullWidth
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'climatizadores' | 'manutencoes')}
                  variant="outlined"
                  className="bg-white"
                  startAdornment={
                    <InputAdornment position="start">
                      <ListIcon className="text-gray-500" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="climatizadores">Climatizadores</MenuItem>
                  <MenuItem value="manutencoes">Manutenções</MenuItem>
                </Select>
              </div>

              {/* Data Inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inicial
                </label>
                <DatePicker
                  label="Início"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                    }
                  }}
                />
              </div>

              {/* Data Final */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Final
                </label>
                <DatePicker
                  label="Fim"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                    }
                  }}
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-6 flex justify-between items-center">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={fetchReportData}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                {loading ? 'Carregando...' : 'Gerar Relatório'}
              </Button>

              <div className="space-x-2">
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={exportToExcel}
                  disabled={!reportData.length}
                  startIcon={<FileExcelIcon />}
                >
                  Exportar Excel
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={exportToPDF}
                  disabled={!reportData.length}
                  startIcon={<FilePdfIcon />}
                >
                  Exportar PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Tabela de Resultados */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="flex items-center">
                <AlertCircleIcon className="mr-2 text-red-500" />
                {error}
              </p>
            </div>
          )}

          {reportData.length > 0 && (
            <div className="overflow-x-auto">
              {renderReportTable()}
            </div>
          )}

          {/* Rodapé */}
          {reportData.length > 0 && (
            <div className="bg-gray-100 p-4 text-right text-sm text-gray-600">
              Total de registros: {reportData.length}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
