import { useState } from "react";
import { ProcessSearchForm } from "@/components/ProcessSearchForm";
import { ProcessDetails, ProcessData } from "@/components/ProcessDetails";
import { PJEService } from "@/services/pjeService";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";

const Index = () => {
  const [processData, setProcessData] = useState<ProcessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (processNumber: string, tribunal?: string) => {
    setIsLoading(true);
    setError(null);
    setProcessData(null);

    try {
      const data = await PJEService.consultarProcesso(processNumber, tribunal);
      setProcessData(data);
      
      toast({
        title: "Consulta realizada",
        description: `Dados do processo ${processNumber} carregados com sucesso (${tribunal || 'TJMG'})`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao consultar processo";
      setError(errorMessage);
      
      toast({
        title: "Erro na consulta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-legal-blue-light/10 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-legal-blue mb-2">
            Sistema de Consulta PJE - Tribunais do Brasil
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Consulte processos judiciais em todos os tribunais do Brasil: TJs estaduais, TRFs, TRTs e TREs
            através dos sistemas PJE e e-SAJ
          </p>
        </div>

        {/* Aviso sobre implementação */}
        <div className="max-w-4xl mx-auto mb-8">
          <Alert className="border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Sistema Completo:</strong> Implementação com edge functions para web scraping 
              em todos os tribunais do Brasil. Detecção automática do tribunal pelo número do processo.
              Processo de exemplo: <code className="bg-amber-100 px-1 rounded">5202268-77.2022.8.13.0024</code> (TJMG).
              <br />
              <strong>Tribunais suportados:</strong> 27 TJs estaduais, 6 TRFs, 24 TRTs e 27 TREs.
            </AlertDescription>
          </Alert>
        </div>

        {/* Formulário de busca */}
        <div className="flex justify-center mb-8">
          <ProcessSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Erro */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Resultados */}
        {processData && (
          <div className="max-w-6xl mx-auto">
            <ProcessDetails processData={processData} />
          </div>
        )}

        {/* Footer com informações da API */}
        {!processData && !isLoading && (
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <h2 className="text-lg font-semibold text-legal-blue mb-4">
                Como usar esta API
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Entrada</h3>
                  <p>Número do processo no formato:</p>
                  <code className="block bg-muted p-2 rounded mt-1 font-mono">
                    NNNNNNN-NN.AAAA.N.NN.NNNN
                  </code>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Saída</h3>
                  <ul className="space-y-1 text-left">
                    <li>• Dados básicos do processo</li>
                    <li>• Informações das partes</li>
                    <li>• Histórico de movimentações</li>
                    <li>• Status atual</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;