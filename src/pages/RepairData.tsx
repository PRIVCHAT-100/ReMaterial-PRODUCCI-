import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";
import { repairUserCompanyLinks } from "@/utils/repairData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RepairData = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleRepair = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const repairResult = await repairUserCompanyLinks();
      setResult(repairResult);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Error desconocido durante la reparación'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Reparación de Datos
              </CardTitle>
              <CardDescription>
                Esta herramienta repara las conexiones entre usuarios, empresas y productos en la base de datos.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">¿Qué hace esta reparación?</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Crea registros de empresa faltantes para usuarios marcados como vendedores</li>
                  <li>Corrige productos con seller_id inválido o nulo</li>
                  <li>Vincula correctamente usuarios con sus empresas y productos</li>
                  <li>Restaura la integridad de datos después de migraciones</li>
                </ul>
              </div>

              <Button 
                onClick={handleRepair} 
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Reparando datos..." : "Iniciar Reparación"}
              </Button>

              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RepairData;