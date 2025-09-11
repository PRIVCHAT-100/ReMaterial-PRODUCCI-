import { useState, useEffect } from 'react';
import { setLanguage } from '@/i18n';
import { useTranslation } from 'react-i18next';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const [lng, setLng] = useState<'es' | 'ca' | 'en'>((localStorage.getItem('lang') as any) || 'es');
  useEffect(() => { setLanguage(lng); }, [lng]);
  return (
    <div className="min-w-[140px]">
      <Select value={lng} onValueChange={(v) => setLng(v as any)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t('language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="es">{t('spanish')}</SelectItem>
          <SelectItem value="ca">{t('catalan')}</SelectItem>
          <SelectItem value="en">{t('english')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
