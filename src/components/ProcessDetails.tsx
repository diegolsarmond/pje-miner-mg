import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Scale, FileText, Clock } from "lucide-react";

export interface ProcessData {
  numero: string;
  dataDistribuicao: string;
  classeJudicial: string;
  assunto: string;
  jurisdicao: string;
  orgaoJulgador: string;
  poloAtivo: Array<{
    nome: string;
    cpf?: string;
    situacao: string;
    tipo: string;
  }>;
  poloPassivo: Array<{
    nome: string;
    cnpj?: string;
    situacao: string;
    tipo: string;
  }>;
  movimentacoes: Array<{
    data: string;
    movimento: string;
    documento?: string;
  }>;
}

interface ProcessDetailsProps {
  processData: ProcessData;
}

export const ProcessDetails = ({ processData }: ProcessDetailsProps) => {
  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho do Processo */}
      <Card className="border-legal-blue-light">
        <CardHeader className="bg-legal-blue-light/20">
          <CardTitle className="flex items-center gap-2 text-legal-blue">
            <Scale className="h-5 w-5" />
            {processData.classeJudicial}
          </CardTitle>
          <p className="text-lg font-mono font-semibold">{processData.numero}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Data de Distribuição:</span>
              <span className="text-sm">{processData.dataDistribuicao}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Jurisdição:</span>
              <span className="text-sm">{processData.jurisdicao}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Órgão Julgador:</p>
            <p className="text-sm text-muted-foreground">{processData.orgaoJulgador}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Assunto:</p>
            <p className="text-sm text-muted-foreground">{processData.assunto}</p>
          </div>
        </CardContent>
      </Card>

      {/* Partes do Processo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Polo Ativo */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Users className="h-5 w-5" />
              Polo Ativo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {processData.poloAtivo.map((parte, index) => (
                <div key={index} className="border rounded-lg p-3 bg-green-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{parte.nome}</h4>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      {parte.situacao}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{parte.tipo}</p>
                  {parte.cpf && (
                    <p className="text-xs text-muted-foreground font-mono">CPF: {parte.cpf}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Polo Passivo */}
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Users className="h-5 w-5" />
              Polo Passivo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {processData.poloPassivo.map((parte, index) => (
                <div key={index} className="border rounded-lg p-3 bg-orange-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{parte.nome}</h4>
                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                      {parte.situacao}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{parte.tipo}</p>
                  {parte.cnpj && (
                    <p className="text-xs text-muted-foreground font-mono">CNPJ: {parte.cnpj}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movimentações */}
      <Card className="border-legal-blue-light">
        <CardHeader className="bg-legal-blue-light/20">
          <CardTitle className="flex items-center gap-2 text-legal-blue">
            <Clock className="h-5 w-5" />
            Movimentações do Processo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {processData.movimentacoes.map((mov, index) => (
              <div key={index} className="border-l-2 border-legal-blue-light pl-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-legal-blue" />
                  <span className="text-sm font-medium text-legal-blue">{mov.data}</span>
                </div>
                <p className="text-sm mb-1">{mov.movimento}</p>
                {mov.documento && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {mov.documento}
                  </div>
                )}
                {index < processData.movimentacoes.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};