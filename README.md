# PJE Scraper - Sistema de Consulta de Processos Judiciais

Sistema completo para consulta de processos judiciais em todos os tribunais do Brasil (TJs estaduais, TRFs, TRTs e TREs).

## 🚀 Funcionalidades

- ✅ Consulta de processos em todos os tribunais do Brasil
- ✅ Interface moderna e responsiva
- ✅ Web scraping automatizado via edge functions
- ✅ Detecção automática do tribunal pelo número do processo
- ✅ Sistema de fallback para dados simulados
- ✅ Configuração para produção com Docker
- ✅ Banco de dados Supabase integrado
- ✅ Logs de scraping e analytics

## 🏛️ Tribunais Suportados

### Tribunais de Justiça Estaduais (27)
- TJAC, TJAL, TJAP, TJAM, TJBA, TJCE, TJDF, TJES, TJGO, TJMA, TJMT, TJMS, TJMG, TJPA, TJPB, TJPR, TJPE, TJPI, TJRJ, TJRN, TJRS, TJRO, TJRR, TJSC, TJSP, TJSE, TJTO

### Tribunais Regionais Federais (6)
- TRF1, TRF2, TRF3, TRF4, TRF5, TRF6

### Tribunais Regionais do Trabalho (24)
- TRT1 ao TRT24

### Tribunais Regionais Eleitorais (27)
- TREs de todos os estados e DF

## 🛠️ Tecnologias

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions
- **Banco de Dados**: Supabase PostgreSQL
- **Deploy**: Docker, Nginx
- **Web Scraping**: Deno com User-Agent rotation

## 🚀 Configuração para Produção

### 1. Requisitos
- Docker e Docker Compose
- Conta Supabase
- Easypanel (opcional)

### 2. Variáveis de Ambiente

Crie um arquivo `.env.production`:

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### 3. Deploy com Docker

```bash
# Build da imagem
docker build -t pje-scraper .

# Executar com docker-compose
docker-compose up -d
```

### 4. Deploy no Easypanel

1. Faça fork deste repositório
2. No Easypanel, crie uma nova aplicação
3. Configure as variáveis de ambiente
4. Deploy automático via Git

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **tribunais**: Cadastro de todos os tribunais
- **processos**: Dados dos processos coletados
- **movimentacoes**: Histórico de movimentações
- **partes_publicas**: Partes dos processos (anonimizadas)
- **scraping_logs**: Logs das operações de scraping
- **fontes_jornais**: Fontes de diários oficiais
- **publicacoes_jornais**: Publicações dos diários

## 🔍 Como Usar

### 1. Consulta Simples
```javascript
import { PJEService } from './services/pjeService';

const dados = await PJEService.consultarProcesso('5202268-77.2022.8.13.0024');
```

### 2. Consulta com Tribunal Específico
```javascript
const dados = await PJEService.consultarProcesso('5202268-77.2022.8.13.0024', 'TJMG');
```

### 3. Detecção Automática do Tribunal
```javascript
const tribunal = PJEService.detectarTribunal('5202268-77.2022.8.13.0024');
console.log(tribunal); // 'TJMG'
```

## 🛡️ Segurança e Rate Limiting

- User-Agent rotation para evitar bloqueios
- Proxy rotation (configurável)
- Rate limiting automático
- Logs detalhados de todas as operações
- Headers de segurança configurados

## 📈 Monitoramento

- Logs de scraping em tempo real
- Analytics de uso via Supabase
- Health checks automáticos
- Alertas de falha configuráveis

## 🔧 Configurações Avançadas

### Rate Limiting
Configure no edge function:
```typescript
const RATE_LIMIT = {
  requests: 10,
  window: 60000 // 1 minuto
};
```

### Proxy Configuration
```typescript
const PROXY_CONFIG = {
  enabled: true,
  rotation: true,
  providers: ['proxy1.com', 'proxy2.com']
};
```

## 📝 Licença

MIT License - veja LICENSE para detalhes.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

- Email: suporte@pje-scraper.com
- Issues: GitHub Issues
- Documentação: [Wiki do projeto]

---

**⚠️ Aviso Legal**: Este sistema é para fins educacionais e de pesquisa. Respeite os termos de uso dos sites dos tribunais e a Lei Geral de Proteção de Dados (LGPD).