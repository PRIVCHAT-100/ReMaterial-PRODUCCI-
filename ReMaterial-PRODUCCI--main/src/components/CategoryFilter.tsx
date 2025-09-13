import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const categories = [
  { id: 'all', name: 'Todos los sectores', count: 2500 },
  { id: 'construccion', name: 'Construcción', count: 850 },
  { id: 'textil', name: 'Textil', count: 420 },
  { id: 'metalurgia', name: 'Metalurgia', count: 380 },
  { id: 'madera', name: 'Madera', count: 290 },
  { id: 'piedra', name: 'Piedra y Mármol', count: 260 },
  { id: 'plastico', name: 'Plástico', count: 200 },
  { id: 'vidrio', name: 'Vidrio', count: 180 },
  { id: 'papel', name: 'Papel', count: 80 },
  { id: 'electronica', name: 'Electrónica', count: 100 },
  { id: 'comida', name: 'Alimentación', count: 60 },
  { id: 'bebidas', name: 'Bebidas', count: 50 },
  { id: 'otros', name: 'Otros', count: 120 },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { t } = useTranslation();

  return (
    <section className="bg-muted/30 py-8 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">{t('ui.explora-por-sector')}</h2>
            <p className="text-muted-foreground">{t('ui.encuentra-materiales-espec-ficos-para-tu-industria')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => onCategoryChange(category.id)}
                className="relative"
              >
                {category.name}
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs bg-background/60"
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;