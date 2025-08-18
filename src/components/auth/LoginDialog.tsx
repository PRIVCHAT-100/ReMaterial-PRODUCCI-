import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

export const LoginDialog = ({ open, onOpenChange, onSwitchToRegister }: LoginDialogProps) => {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      onOpenChange(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ui.iniciar-sesi-n')}</DialogTitle>
          <DialogDescription>{t('ui.accede-a-tu-cuenta-para-gestionar-tus-productos-y-')}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('ui.tu-empresa-com')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t('ui.contrase-a')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar Sesión
          </Button>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t('ui.no-tienes-cuenta')}</span>
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => {
                onOpenChange(false);
                onSwitchToRegister();
              }}
            >
              Regístrate aquí
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};