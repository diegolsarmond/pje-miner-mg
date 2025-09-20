import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessoRequest {
  numeroProcesso: string;
  tribunalCodigo?: string;
}

interface ProcessoData {
  numero: string;
  dataDistribuicao: string;
  classeJudicial: string;
  assunto: string;
  jurisdicao: string;
  orgaoJulgador: string;
  poloAtivo: Array<{
    nome: string;
    cpf?: string;
    cnpj?: string;
    situacao: string;
    tipo: string;
  }>;
  poloPassivo: Array<{
    nome: string;
    cpf?: string;
    cnpj?: string;
    situacao: string;
    tipo: string;
  }>;
  movimentacoes: Array<{
    data: string;
    movimento: string;
  }>;
}

interface TribunalRecord {
  codigo: string;
  nome: string;
  api_disponivel?: boolean;
}

type UnknownRecord = Record<string, unknown>;

function toRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? value as UnknownRecord : {};
}

function toArrayOfRecords(value: unknown): UnknownRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is UnknownRecord => Boolean(item) && typeof item === 'object')
    : [];
}

function pickString(record: UnknownRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { numeroProcesso, tribunalCodigo = 'TJMG' }: ProcessoRequest = await req.json();
    
    console.log(`Iniciando scraping para processo: ${numeroProcesso} no tribunal: ${tribunalCodigo}`);
    
    // Buscar informações do tribunal no banco
    const { data: tribunal, error: tribunalError } = await supabase
      .from('tribunais')
      .select('*')
      .eq('codigo', tribunalCodigo)
      .single();

    if (tribunalError || !tribunal) {
      throw new Error(`Tribunal ${tribunalCodigo} não encontrado`);
    }

    // Registrar log de scraping
    await supabase
      .from('scraping_logs')
      .insert({
        tribunal_id: tribunal.id,
        url_acessada: tribunal.url_base,
        metodo: 'GET',
        sucesso: false,
        processos_coletados: 0
      });

    let processData: ProcessoData;

    // Implementar scraping específico por tribunal
    switch (tribunalCodigo) {
      case 'TJMG':
        processData = await scrapeTJMG(numeroProcesso, tribunal.url_base);
        break;
      case 'TJSP':
        processData = await scrapeTJSP(numeroProcesso, tribunal.url_base);
        break;
      default:
        if (tribunal.api_disponivel) {
          processData = await scrapeGenerico(numeroProcesso, tribunal);
          break;
        }

        throw new Error(`Scraping para o tribunal ${tribunalCodigo} ainda não foi implementado`);
    }

    // Salvar dados no banco
    await salvarProcessoNoBanco(processData, tribunal.id);

    // Atualizar log com sucesso
    await supabase
      .from('scraping_logs')
      .insert({
        tribunal_id: tribunal.id,
        url_acessada: tribunal.url_base,
        metodo: 'GET',
        sucesso: true,
        processos_coletados: 1,
        status_code: 200
      });

    return new Response(JSON.stringify(processData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Erro no scraping:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function sanitizeProcessNumber(numeroProcesso: string): string {
  return numeroProcesso.replace(/\D/g, '');
}

function maskCpf(valor?: string): string | undefined {
  if (!valor) return undefined;
  const digits = valor.replace(/\D/g, '');
  if (digits.length !== 11) return undefined;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function maskCnpj(valor?: string): string | undefined {
  if (!valor) return undefined;
  const digits = valor.replace(/\D/g, '');
  if (digits.length !== 14) return undefined;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatDateToBR(dateValue?: string | null): string {
  if (!dateValue) return '';

  const parsed = new Date(dateValue);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('pt-BR');
  }

  // Alguns tribunais retornam datas já formatadas
  return dateValue;
}

function formatDateTimeToBR(dateValue?: string | null): string {
  if (!dateValue) return '';

  const parsed = new Date(dateValue);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleString('pt-BR');
  }

  return dateValue;
}

function normalizeAssuntos(dadosBasicos: UnknownRecord): string {
  const assuntos = dadosBasicos['assunto'] || dadosBasicos['assuntos'] || dadosBasicos['assuntoPrincipal'];

  if (Array.isArray(assuntos)) {
    return assuntos
      .map((assunto: unknown) => {
        if (!assunto || typeof assunto !== 'object') {
          return typeof assunto === 'string' ? assunto : undefined;
        }

        const assuntoRecord = assunto as UnknownRecord;
        return (pickString(assuntoRecord, 'descricao') || pickString(assuntoRecord, 'nome')) ?? undefined;
      })
      .filter(Boolean)
      .join(' / ');
  }

  const principais = (assuntos as UnknownRecord)?.['principais'];
  if (Array.isArray(principais)) {
    return principais
      .map((assunto: unknown) => {
        if (!assunto || typeof assunto !== 'object') {
          return typeof assunto === 'string' ? assunto : undefined;
        }

        const assuntoRecord = assunto as UnknownRecord;
        return pickString(assuntoRecord, 'descricao') || pickString(assuntoRecord, 'nome');
      })
      .filter(Boolean)
      .join(' / ');
  }

  if (typeof assuntos === 'string') {
    return assuntos;
  }

  return 'Assunto não informado';
}

function extractPartes(sourceInput: UnknownRecord) {
  const processoExterno = toRecord(sourceInput['processo']);
  const processo = Object.keys(processoExterno).length ? processoExterno : sourceInput;
  const dadosBasicos = toRecord(processo['dadosBasicos']);
  const processoInterno = toRecord(processo['processo']);

  const candidatosAtivos = [
    toArrayOfRecords(processo['poloAtivo']),
    toArrayOfRecords(processo['partesAtivas']),
    toArrayOfRecords(processo['partesPoloAtivo']),
    toArrayOfRecords(dadosBasicos['poloAtivo']),
    toArrayOfRecords(processoInterno['poloAtivo'])
  ];

  const candidatosPassivos = [
    toArrayOfRecords(processo['poloPassivo']),
    toArrayOfRecords(processo['partesPassivas']),
    toArrayOfRecords(processo['partesPoloPassivo']),
    toArrayOfRecords(dadosBasicos['poloPassivo']),
    toArrayOfRecords(processoInterno['poloPassivo'])
  ];

  const partesGerais = [
    ...toArrayOfRecords(processo['partes']),
    ...toArrayOfRecords(processoInterno['partes'])
  ];

  const ativosEncontrados = candidatosAtivos.find((partes) => partes.length > 0) || [];
  const passivosEncontrados = candidatosPassivos.find((partes) => partes.length > 0) || [];

  const identificarPolo = (parte: UnknownRecord) => {
    const polo = (
      pickString(parte, 'polo')
      || pickString(parte, 'poloProcessual')
      || pickString(parte, 'poloParte')
      || pickString(parte, 'tipoPolo')
      || ''
    ).toUpperCase();

    if (polo.includes('ATIVO')) return 'ATIVO';
    if (polo.includes('PASSIVO')) return 'PASSIVO';
    return undefined;
  };

  const ativos = ativosEncontrados.length
    ? ativosEncontrados
    : partesGerais.filter((parte) => identificarPolo(parte) === 'ATIVO');

  const passivos = passivosEncontrados.length
    ? passivosEncontrados
    : partesGerais.filter((parte) => identificarPolo(parte) === 'PASSIVO');

  const mapParte = (parte: UnknownRecord) => {
    const pessoa = toRecord(parte['pessoa']);
    const nome = pickString(parte, 'nome') || pickString(pessoa, 'nome') || pickString(pessoa, 'nomeParte') || 'Parte não informada';
    const documento = pickString(parte, 'documento')
      || pickString(parte, 'documentoPrincipal')
      || pickString(parte, 'cpf')
      || pickString(parte, 'cnpj')
      || pickString(parte, 'numeroDocumento');
    const situacao = pickString(parte, 'situacao')
      || pickString(parte, 'tipoParticipacao')
      || pickString(parte, 'papel')
      || pickString(parte, 'descricaoPolo')
      || 'Parte';
    const tipo = pickString(parte, 'tipo')
      || pickString(parte, 'tipoParte')
      || pickString(parte, 'classeParte')
      || pickString(parte, 'papel')
      || 'Parte';

    return {
      nome,
      documento,
      situacao,
      tipo
    };
  };

  return {
    ativos: ativos.map(mapParte),
    passivos: passivos.map(mapParte)
  };
}

function mapProcessDataFromSource(sourceInput: unknown, numeroProcesso: string): ProcessoData {
  const source = toRecord(sourceInput);
  const processoPrimario = toRecord(source['processo']);
  const processo = Object.keys(processoPrimario).length ? processoPrimario : source;
  const dadosBasicos = toRecord(processo['dadosBasicos']);
  const classeProcessual = toRecord(dadosBasicos['classeProcessual']);
  const orgaoJulgadorRegistro = toRecord(dadosBasicos['orgaoJulgador']);
  const comarcaRegistro = toRecord(dadosBasicos['comarca']);
  const localidadeRegistro = toRecord(dadosBasicos['localidade']);

  const numero = pickString(dadosBasicos, 'numeroProcesso')
    || pickString(dadosBasicos, 'numero')
    || pickString(processo, 'numeroProcesso')
    || numeroProcesso;

  const classeJudicial = pickString(classeProcessual, 'descricao')
    || pickString(classeProcessual, 'nome')
    || pickString(dadosBasicos, 'classe')
    || 'Classe não informada';

  const assunto = normalizeAssuntos(dadosBasicos);

  const jurisdicao = pickString(comarcaRegistro, 'descricao')
    || pickString(comarcaRegistro, 'nome')
    || pickString(localidadeRegistro, 'descricao')
    || (typeof dadosBasicos['municipio'] === 'string' ? dadosBasicos['municipio'] as string : undefined)
    || 'Jurisdição não informada';

  const orgaoJulgador = pickString(orgaoJulgadorRegistro, 'nome')
    || (typeof dadosBasicos['orgaoJulgador'] === 'string' ? dadosBasicos['orgaoJulgador'] as string : undefined)
    || pickString(processo, 'orgaoJulgador')
    || 'Órgão julgador não informado';

  const dataDistribuicao = formatDateToBR(
    pickString(dadosBasicos, 'dataDistribuicao')
    || pickString(dadosBasicos, 'dataAutuacao')
    || pickString(dadosBasicos, 'dataAjuizamento')
    || pickString(processo, 'dataDistribuicao')
  );

  const { ativos, passivos } = extractPartes(processo);

  const poloAtivo = ativos.map((parte) => {
    const cpf = maskCpf(parte.documento);
    return {
      nome: parte.nome,
      cpf,
      situacao: parte.situacao,
      tipo: parte.tipo
    };
  });

  const poloPassivo = passivos.map((parte) => {
    const cnpj = maskCnpj(parte.documento);
    return {
      nome: parte.nome,
      cnpj: cnpj || undefined,
      situacao: parte.situacao,
      tipo: parte.tipo
    };
  });

  const movimentosOrigem = [
    ...toArrayOfRecords(processo['movimentos']),
    ...toArrayOfRecords(processo['timeline']),
    ...toArrayOfRecords(toRecord(processo['processo'])['movimentos']),
    ...toArrayOfRecords(toRecord(processo['processo'])['timeline'])
  ];

  const movimentacoes = movimentosOrigem
    .map((movimento) => {
      const descricao = pickString(movimento, 'descricao')
        || pickString(movimento, 'movimento')
        || pickString(movimento, 'texto')
        || pickString(movimento, 'descricaoEvento');

      if (!descricao) {
        return null;
      }

      const data = pickString(movimento, 'dataHora')
        || pickString(movimento, 'dataMovimento')
        || pickString(movimento, 'data')
        || pickString(movimento, 'momento')
        || pickString(movimento, 'dataAto');

      return {
        data: formatDateTimeToBR(data),
        movimento: descricao,
        documento: pickString(movimento, 'documento') || pickString(movimento, 'complemento')
      };
    })
    .filter((movimento): movimento is { data: string; movimento: string; documento?: string } => movimento !== null);

  return {
    numero,
    dataDistribuicao,
    classeJudicial,
    assunto,
    jurisdicao,
    orgaoJulgador,
    poloAtivo,
    poloPassivo,
    movimentacoes
  };
}

async function fetchProcessoFromDataJud(tribunalCodigo: string, numeroProcesso: string): Promise<ProcessoData> {
  const apiKey = Deno.env.get('DATAJUD_API_KEY');
  if (!apiKey) {
    throw new Error('Variável de ambiente DATAJUD_API_KEY não configurada');
  }

  const numeroSanitizado = sanitizeProcessNumber(numeroProcesso);
  if (!numeroSanitizado) {
    throw new Error('Número de processo inválido');
  }

  const endpoint = `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunalCodigo.toLowerCase()}/_search`;

  const payload = {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: numeroSanitizado,
              type: 'phrase',
              fields: ['numeroProcesso', 'numeroProcessoUnificado', 'numeroProcessoMascarado']
            }
          }
        ]
      }
    },
    size: 1
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'PJE Miner Edge Function/1.0',
      'Authorization': `APIKey ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`DataJud retornou status ${response.status}`);
  }

  const body = await response.json();
  const hits = body?.hits?.hits;

  if (!Array.isArray(hits) || hits.length === 0) {
    throw new Error('Processo não encontrado na base DataJud');
  }

  const source = hits[0]?._source || hits[0]?.source || hits[0];
  return mapProcessDataFromSource(source, numeroProcesso);
}

async function fetchProcessoFromTJMG(numeroProcesso: string, urlBase: string): Promise<ProcessoData> {
  const numeroSanitizado = sanitizeProcessNumber(numeroProcesso);
  if (!numeroSanitizado) {
    throw new Error('Número de processo inválido');
  }

  const detalhesUrl = new URL(`/pje-consulta-api/api/processos/detalhes?numeroProcesso=${numeroSanitizado}&tipoProcesso=UNICO`, urlBase);

  const response = await fetch(detalhesUrl.toString(), {
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': urlBase
    }
  });

  if (!response.ok) {
    throw new Error(`TJMG retornou status ${response.status}`);
  }

  const data = await response.json();
  return mapProcessDataFromSource(data, numeroProcesso);
}

async function fetchProcessoFromTJSP(numeroProcesso: string): Promise<ProcessoData> {
  // O TJSP expõe dados consolidados via DataJud
  return fetchProcessoFromDataJud('TJSP', numeroProcesso);
}

async function scrapeTJMG(numeroProcesso: string, urlBase: string): Promise<ProcessoData> {
  console.log(`Fazendo scraping do TJMG para processo: ${numeroProcesso}`);

  try {
    return await fetchProcessoFromTJMG(numeroProcesso, urlBase);
  } catch (error) {
    console.warn('Falha ao consultar o endpoint direto do TJMG, tentando DataJud', error);
    return await fetchProcessoFromDataJud('TJMG', numeroProcesso);
  }
}

async function scrapeTJSP(numeroProcesso: string, _urlBase: string): Promise<ProcessoData> {
  console.log(`Fazendo scraping do TJSP para processo: ${numeroProcesso}`);

  return await fetchProcessoFromTJSP(numeroProcesso);
}

async function scrapeGenerico(numeroProcesso: string, tribunal: TribunalRecord): Promise<ProcessoData> {
  console.log(`Fazendo scraping genérico para processo: ${numeroProcesso} no tribunal: ${tribunal.nome}`);

  if (!tribunal?.codigo) {
    throw new Error('Tribunal inválido para scraping genérico');
  }

  if (!tribunal?.api_disponivel) {
    throw new Error(`Tribunal ${tribunal.codigo} ainda não possui scraping implementado`);
  }

  return await fetchProcessoFromDataJud(tribunal.codigo, numeroProcesso);
}

async function salvarProcessoNoBanco(processData: ProcessoData, tribunalId: string) {
  try {
    // Inserir processo
    const { data: processo, error: processoError } = await supabase
      .from('processos')
      .insert({
        numero_processo: processData.numero,
        classe_processual: processData.classeJudicial,
        assunto: processData.assunto,
        data_distribuicao: processData.dataDistribuicao ? new Date(processData.dataDistribuicao.split('/').reverse().join('-')).toISOString().split('T')[0] : null,
        tribunal_id: tribunalId,
        origem_coleta: 'scraping_automatizado',
        situacao: 'ativo'
      })
      .select()
      .single();

    if (processoError) {
      console.error('Erro ao inserir processo:', processoError);
      return;
    }

    // Inserir partes
    for (const parte of [...processData.poloAtivo, ...processData.poloPassivo]) {
      await supabase
        .from('partes_publicas')
        .insert({
          processo_id: processo.id,
          nome_anonimizado: parte.nome,
          tipo_parte: parte.tipo,
          tipo_pessoa: parte.cpf ? 'fisica' : parte.cnpj ? 'juridica' : 'nao_informado'
        });
    }

    // Inserir movimentações
    for (const [index, movimentacao] of processData.movimentacoes.entries()) {
      await supabase
        .from('movimentacoes')
        .insert({
          processo_id: processo.id,
          descricao_movimento: movimentacao.movimento,
          data_movimento: movimentacao.data ? new Date(movimentacao.data).toISOString() : new Date().toISOString(),
          ordem: index + 1
        });
    }

    console.log('Processo salvo com sucesso no banco de dados');
  } catch (error) {
    console.error('Erro ao salvar processo no banco:', error);
  }
}