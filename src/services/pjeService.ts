import { ProcessData } from "@/components/ProcessDetails";

export class PJEService {
  private static readonly BASE_URL = "https://pje-consulta-publica.tjmg.jus.br";
  
  // Esta é uma implementação simulada para demonstração
  // Em um ambiente real, você precisaria implementar web scraping com CORS proxy
  static async consultarProcesso(numeroProcesso: string): Promise<ProcessData> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dados simulados baseados na estrutura real do PJE-TJMG
    const mockData: ProcessData = {
      numero: numeroProcesso,
      dataDistribuicao: "21/09/2022",
      classeJudicial: "[CÍVEL] CUMPRIMENTO DE SENTENÇA (156)",
      assunto: "DIREITO CIVIL (899) - Responsabilidade Civil (10431) - Indenização por Dano Moral (10433 DIREITO DO CONSUMIDOR (1156) - Responsabilidade do Fornecedor (6220) - Indenização por Dano Moral (7779 DIREITO DO CONSUMIDOR (1156) - Responsabilidade do Fornecedor (6220) - Indenização por Dano Material (7780",
      jurisdicao: "Belo Horizonte",
      orgaoJulgador: "CENTRASE Cível de Belo Horizonte - Central de Cumprimento de Sentenças",
      poloAtivo: [
        {
          nome: "DIEGO LEONARDO DA SILVA ARMOND",
          cpf: "115.451.116-26",
          situacao: "Ativo",
          tipo: "REQUERENTE"
        }
      ],
      poloPassivo: [
        {
          nome: "OI S.A. - EM RECUPERAÇÃO JUDICIAL",
          cnpj: "76.535.764/0001-43",
          situacao: "Ativo",
          tipo: "REQUERIDO(A)"
        }
      ],
      movimentacoes: [
        {
          data: "03/09/2025 13.05.25",
          movimento: "Juntada de Petição de petição"
        },
        {
          data: "02/09/2025 00.26.53",
          movimento: "Publicado Intimação em 02/09/2025"
        },
        {
          data: "02/09/2025 00.26.53",
          movimento: "Disponibilizado no DJ Eletrônico em 01/09/2025"
        },
        {
          data: "29/08/2025 14.42.00",
          movimento: "Expedida/certificada a comunicação eletrônica"
        },
        {
          data: "22/04/2025 14.57.18",
          movimento: "Juntada de Petição de petição"
        },
        {
          data: "11/04/2025 13.55.11",
          movimento: "Juntada de Petição de petição"
        },
        {
          data: "29/03/2025 00.29.18",
          movimento: "Decorrido prazo de OI S.A. - EM RECUPERAÇÃO JUDICIAL em 28/03/2025 23.59"
        },
        {
          data: "19/03/2025 15.48.44",
          movimento: "Juntada de Petição de petição"
        }
      ]
    };

    // Verifica se o número do processo corresponde ao exemplo conhecido
    if (numeroProcesso === "5202268-77.2022.8.13.0024") {
      return mockData;
    }

    // Para outros números, retorna dados genéricos
    return {
      ...mockData,
      numero: numeroProcesso,
      dataDistribuicao: "Data não disponível",
      classeJudicial: "Processo não encontrado ou dados indisponíveis",
      assunto: "Consulte o processo diretamente no site do PJE-TJMG",
      jurisdicao: "N/A",
      orgaoJulgador: "N/A",
      poloAtivo: [],
      poloPassivo: [],
      movimentacoes: [
        {
          data: new Date().toLocaleDateString("pt-BR"),
          movimento: "Processo consultado via API simulada"
        }
      ]
    };
  }

  // Método para implementar consulta real via proxy/backend
  static async consultarProcessoReal(numeroProcesso: string): Promise<ProcessData> {
    try {
      // Em um ambiente real, você faria uma requisição para seu backend
      // que implementaria o web scraping do site do PJE
      const response = await fetch('/api/pje/consultar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numeroProcesso }),
      });

      if (!response.ok) {
        throw new Error('Erro na consulta do processo');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao consultar processo:', error);
      throw error;
    }
  }

  static formatarNumeroProcesso(numero: string): string {
    // Remove caracteres não numéricos
    const apenasNumeros = numero.replace(/\D/g, '');
    
    // Aplica formatação NNNNNNN-NN.AAAA.N.NN.NNNN
    if (apenasNumeros.length === 20) {
      return `${apenasNumeros.slice(0, 7)}-${apenasNumeros.slice(7, 9)}.${apenasNumeros.slice(9, 13)}.${apenasNumeros.slice(13, 14)}.${apenasNumeros.slice(14, 16)}.${apenasNumeros.slice(16, 20)}`;
    }
    
    return numero;
  }

  static validarNumeroProcesso(numero: string): boolean {
    const regex = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
    return regex.test(numero);
  }
}