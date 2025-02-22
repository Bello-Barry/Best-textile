"use client";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FABRIC_CONFIG, FabricType, FabricSubtype, FabricUnit } from "@/types/fabric-config";

type SelectFabricProps = {
  selectedType: FabricType | null;
  onTypeChange: (type: FabricType) => void;
  selectedSubtype: FabricSubtype | "";
  onSubtypeChange: (subtype: FabricSubtype) => void;
  selectedUnit: FabricUnit;
  onUnitChange: (unit: FabricUnit) => void;
};

export default function SelectFabric({
  selectedType,
  onTypeChange,
  selectedSubtype,
  onSubtypeChange,
  selectedUnit,
  onUnitChange
}: SelectFabricProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Sélecteur de type principal */}
      <div>
        <label className="block text-sm font-medium mb-2">Type de tissu</label>
        <Select value={selectedType || ""} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un tissu" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FABRIC_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sélecteur de sous-type */}
      <div>
        <label className="block text-sm font-medium mb-2">Variante</label>
        <Select 
          value={selectedSubtype} 
          onValueChange={onSubtypeChange}
          disabled={!selectedType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir une variante" />
          </SelectTrigger>
          <SelectContent>
            {selectedType && FABRIC_CONFIG[selectedType].subtypes.map(subtype => (
              <SelectItem key={subtype} value={subtype}>
                {subtype}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sélecteur d'unité */}
      <div>
        <label className="block text-sm font-medium mb-2">Unité</label>
        <Select 
          value={selectedUnit} 
          onValueChange={onUnitChange}
          disabled={!selectedType}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectedType && FABRIC_CONFIG[selectedType].units.map(unit => (
              <SelectItem key={unit} value={unit}>
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}