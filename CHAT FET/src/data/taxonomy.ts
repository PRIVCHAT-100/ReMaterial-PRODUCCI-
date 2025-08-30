import i18n from '../i18n';
export type Taxon = { slug: string; label: string; children?: Taxon[] };
export const TAXONOMY: Taxon[] = [
  { slug: "construccion", label: i18n.t('ui.construcci-n'), children: [
    { slug: "acero-corrugado", label: "Acero corrugado" },
    { slug: "ceramica", label: i18n.t('ui.cer-mica-sobrante') },
  ]},
  { slug: "metalurgia", label: "Metalurgia", children: [
    { slug: "aluminio", label: "Aluminio" },
    { slug: "inox", label: "Acero inoxidable" },
  ]},
  // ...
];