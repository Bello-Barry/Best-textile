export const FABRIC_CONFIG = {
  gabardine: {
    name: "Gabardine",
    subtypes: Array.from({ length: 12 }, (_, i) => `Type ${i + 1}`),
    units: ["mètre", "rouleau"],
    defaultUnit: "mètre"
  },
  bazin: {
    name: "Bazin",
    subtypes: ["Riche", "Getzner", "Super", "Doré", "Impérial"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  soie: {
    name: "Soie",
    subtypes: ["Naturelle", "Charmeuse", "Dupion", "Satinée", "Organza"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  velours: {
    name: "Velours",
    subtypes: ["Côtelé", "Cisélé", "Millefleurs", "De soie"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  satin: {
    name: "Satin",
    subtypes: ["De Paris", "Duchesse", "Charme", "Coton"],
    units: ["mètre"],
    defaultUnit: "mètre"
  }
} as const;

export type FabricType = keyof typeof FABRIC_CONFIG;
export type FabricSubtype = typeof FABRIC_CONFIG[FabricType]["subtypes"][number];
export type FabricUnit = typeof FABRIC_CONFIG[FabricType]["units"][number];

export function isFabricType(type: string): type is FabricType {
  return type in FABRIC_CONFIG;
}

export function isFabricSubtype(
  type: FabricType,
  subtype: string
): subtype is FabricSubtype {
  return (FABRIC_CONFIG[type].subtypes as readonly string[]).includes(subtype);
}
