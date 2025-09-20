import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { PJEService } from "@/services/pjeService";

interface ProcessSearchFormProps {
  onSearch: (processNumber: string, tribunal?: string) => void;
  isLoading: boolean;
}

export const ProcessSearchForm = ({ onSearch, isLoading }: ProcessSearchFormProps) => {
  const [processNumber, setProcessNumber] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!processNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite o número do processo",
        variant: "destructive",
      });
      return;
    }

    // Validação básica do formato do número do processo
    if (!PJEService.validarNumeroProcesso(processNumber)) {
      toast({
        title: "Formato inválido",
        description: "Use o formato: NNNNNNN-NN.AAAA.N.NN.NNNN",
        variant: "destructive",
      });
      return;
    }

    // Detectar tribunal automaticamente
    const tribunalDetectado = PJEService.detectarTribunal(processNumber);
    
    toast({
      title: "Tribunal detectado",
      description: `Consultando no ${tribunalDetectado}`,
    });

    onSearch(processNumber, tribunalDetectado);
  };

  const formatProcessNumber = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara NNNNNNN-NN.AAAA.N.NN.NNNN
    if (numbers.length <= 7) {
      return numbers;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length <= 13) {
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9)}`;
    } else if (numbers.length <= 14) {
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13)}`;
    } else if (numbers.length <= 16) {
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14)}`;
    } else {
      return `${numbers.slice(0, 7)}-${numbers.slice(7, 9)}.${numbers.slice(9, 13)}.${numbers.slice(13, 14)}.${numbers.slice(14, 16)}.${numbers.slice(16, 20)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatProcessNumber(e.target.value);
    setProcessNumber(formatted);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-legal-blue-light">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-legal-blue-light rounded-full">
            <FileText className="h-6 w-6 text-legal-blue" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-legal-blue">Consulta PJE - Tribunais do Brasil</CardTitle>
        <p className="text-sm text-muted-foreground">
          Digite o número do processo para consultar em qualquer tribunal
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="process" className="text-sm font-medium text-foreground">
              Número do Processo
            </label>
            <Input
              id="process"
              type="text"
              value={processNumber}
              onChange={handleInputChange}
              placeholder="NNNNNNN-NN.AAAA.N.NN.NNNN"
              className="text-center font-mono tracking-wider"
              maxLength={25}
              required
            />
            <p className="text-xs text-muted-foreground text-center">
              Exemplo: 5202268-77.2022.8.13.0024
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-legal-blue hover:bg-legal-blue-dark text-primary-foreground"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Consultar Processo
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};