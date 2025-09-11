import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { setLanguage } from '@/i18n';
import { useTranslation } from 'react-i18next';

export default function LanguageNudge() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<'es' | 'ca' | 'en'>('es');

  useEffect(() => { if (user && !localStorage.getItem('lang')) setOpen(true); }, [user?.id]);
  const confirm = () => { setLanguage(value); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader><DialogTitle>{t('choose_language_title')}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Select value={value} onValueChange={(v) => setValue(v as any)}>
            <SelectTrigger><SelectValue placeholder={t('language')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="es">{t('spanish')}</SelectItem>
              <SelectItem value="ca">{t('catalan')}</SelectItem>
              <SelectItem value="en">{t('english')}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{t('choose_language_now')}</Button>
            <Button onClick={confirm}>{t('confirm')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
