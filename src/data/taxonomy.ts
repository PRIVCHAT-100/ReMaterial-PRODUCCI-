export type Taxon = { slug: string; label: string; children?: Taxon[] };
export const TAXONOMY: Taxon[] = [
  { slug: "construccion", label: "Construcción", children: [
    { slug: "acero-corrugado", label: "Acero corrugado" },
    { slug: "ceramica", label: "Cerámica sobrante" },
  ]},
  { slug: "metalurgia", label: "Metalurgia", children: [
    { slug: "aluminio", label: "Aluminio" },
    { slug: "inox", label: "Acero inoxidable" },
  ]},
  // ...
];
