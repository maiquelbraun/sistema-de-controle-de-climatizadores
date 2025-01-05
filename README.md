# Sistema de Controle de Climatizadores

## Descrição
Um sistema de gerenciamento de climatizadores com funcionalidades avançadas de cadastro, manutenção e monitoramento.

## Funcionalidades Principais
- 📊 Dashboard com métricas de climatizadores
- 🌡️ Registro e gerenciamento de climatizadores
- 🔧 Controle de manutenções preventivas e corretivas
- 🚨 Alertas de manutenção necessária
- 📈 Rastreamento do histórico de manutenções
- 📋 Geração de relatórios personalizados
- 📤 Exportação de dados para Excel

## Requisitos
- Node.js (v18 ou superior)
- npm

## Instalação
1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o banco de dados:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Tecnologias
- Next.js 13
- Prisma ORM
- Material-UI
- TypeScript
- SQLite
- SheetJS (Exportação Excel)

## Funcionalidades Detalhadas

### Dashboard
- Visão geral de climatizadores
- Contagem de climatizadores ativos
- Próximas manutenções
- Status de climatizadores

### Climatizadores
- Cadastro completo
- Edição de informações
- Exclusão
- Filtro por status

### Manutenções
- Registro de manutenções
- Histórico detalhado
- Associação com climatizadores
- Cálculo automático de próximas manutenções

### Relatórios
- Geração de relatórios de climatizadores
- Geração de relatórios de manutenções
- Filtro por intervalo de datas
- Exportação para Excel

## Contribuição
Pull requests são bem-vindos. Para mudanças importantes, abra um issue primeiro para discutir o que você gostaria de mudar.

## Licença
[Especifique a licença]

## Contato
[Adicione informações de contato]
