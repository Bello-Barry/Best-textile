"use client";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FABRIC_CONFIG, 
  FabricType, 
  FabricUnit,
  isFabricType,
  isFabricSubtype
} from "@/types/fabric-config";

type SelectFabricProps = {
  selectedType: FabricType | null;
  onTypeChange: (type: FabricType) => void;
  selectedSubtype: string;
  onSubtypeChange: (subtype: string) => void;
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
  const handleTypeChange = (value: string) => {
    if (isFabricType(value)) {
      onTypeChange(value);
    }
  };

  const handleSubtypeChange = (value: string) => {
    if (selectedType && isFabricSubtype(selectedType, value)) {
      onSubtypeChange(value);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">Type de tissu</label>
        <Select value={selectedType || ""} onValueChange={handleTypeChange}>
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

      <div>
        <label className="block text-sm font-medium mb-2">Variante</label>
        <Select 
          value={selectedSubtype} 
          onValueChange={handleSubtypeChange}
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

      <div>
        <label className="block text-sm font-medium mb-2">Unité</label>
        <Select 
          value={selectedUnit} 
          onValueChange={value => onUnitChange(value as FabricUnit)}
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