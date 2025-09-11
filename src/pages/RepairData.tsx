import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";
import { repairUserCompanyLinks } from "@/utils/repairData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const RepairData = () => {
  const { t } = useTranslation();

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
                <Database className="h-5 w-5" />{t('ui.reparaci-n-de-datos')}</CardTitle>
              <CardDescription>{t('ui.esta-herramienta-repara-las-conexiones-entre-usuar')}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">{t('ui.qu-hace-esta-reparaci-n')}</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t('ui.crea-registros-de-empresa-faltantes-para-usuarios-')}</li>
                  <li>{t('ui.corrige-productos-con-seller-id-inv-lido-o-nulo')}</li>
                  <li>{t('ui.vincula-correctamente-usuarios-con-sus-empresas-y-')}</li>
                  <li>{t('ui.restaura-la-integridad-de-datos-despu-s-de-migraci')}</li>
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