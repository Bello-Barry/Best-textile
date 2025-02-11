import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFiltersProps {
  filters: { type: string; search: string };
  setFilters: (filters: any) => void;
}

export default function ProductFilters({ filters, setFilters }: ProductFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {/* Recherche */}
      <Input
        placeholder="Rechercher un produit..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      {/* Filtre par type */}
      <Select
        onValueChange={(value) => setFilters({ ...filters, type: value })}
        defaultValue={filters.type}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrer par type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous</SelectItem>
          <SelectItem value="soie">Soie</SelectItem>
          <SelectItem value="bazin">Bazin</SelectItem>
          <SelectItem value="autre">Autre</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}