// types/fabric-config.ts

export type FabricUnit = 
  | "mètre" 
  | "rouleau" 
  | "pièce" 
  | "complet" 
  | "yards" 
  | "bande" 
  | "yard";

export type FabricSubtype = string; 
export type FabricType = keyof typeof FABRIC_CONFIG;

export interface FabricConfigItem {
  name: string;
  subtypes: string[];
  units: FabricUnit[];
  defaultUnit: FabricUnit;
}

export const FABRIC_CONFIG = {
  gabardine: {
    name: "Gabardine",
    subtypes: Array.from({ length: 12 }, (_, i) => `Type ${i + 1}`),
    units: ["mètre", "rouleau"] as const,
    defaultUnit: "mètre"
  },
  bazin: {
    name: "Bazin",
    subtypes: ["Riche", "Getzner", "Superfanga", "Doré", "Impérial"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },
  soie: {
    name: "Soie",
    subtypes: ["uni", "perlée Bazin", "Bazin", "fleurie", "plissée", "motif pagne"],
    units: ["pièce","mètre"] as const,
    defaultUnit: "mètre"
  },
  velours: {
    name: "Velours",
    subtypes: ["Côtelé", "Cisélé", "De soie"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },
  satin: {
    name: "Satin",
    subtypes: ["De Paris", "Duchesse", "riche", "Coton"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },
  kente: {
    name: "Kente",
    subtypes: ["Adweneasa", "Sika Futuro", "Oyokoman","traditionnel", "Asasia", "Babadua"],
    units: ["pièce", "mètre"] as const,
    defaultUnit: "mètre"
  },
  lin: {
    name: "Lin",
    subtypes: ["Naturel", "Lavé", "Mélangé", "Brodé", "Fin"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },
  mousseline: {
    name: "Mousseline",
    subtypes: ["De soie", "De coton", "Brodée", "Imprimée", "Légère"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },
  pagne: {
    name: "Pagne",
    subtypes: ["Wax", "Super Wax", "Fancy", "Java", "Woodin", "Vlisco"],
    units: ["complet", "yards", "mètre"] as const,
    defaultUnit: "complet"
  },
  moustiquaire: {
    name: "Moustiquaire",
    subtypes: ["Simple", "Brodée", "Renforcée", "Colorée"],
    units: ["pièce", "mètre"] as const,
    defaultUnit: "mètre"
  },
  brocart: {
    name: "Brocart",
    subtypes: ["Damassé", "Jacquard", "Métallique", "Relief", "Traditionnel"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },
  bogolan: {
    name: "Bogolan",
    subtypes: ["Traditionnel", "Moderne", "Bamanan", "Ségovien", "Minianka"],
    units: ["bande", "mètre"] as const,
    defaultUnit: "mètre"
  },
  dashiki: {
    name: "Dashiki",
    subtypes: ["Classique", "Brodé", "Angelina", "Festif", "Royal"],
    units: ["pièce"] as const,
    defaultUnit: "mètre"
  },
  adire: {
    name: "Adire",
    subtypes: ["Eleko", "Alabere", "Oniko", "Batik", "Moderne"],
    units: ["yard", "mètre"] as const,
    defaultUnit: "mètre"
  },
  ankara: {
    name: "Ankara",
    subtypes: ["Hollandais", "Hitarget", "ABC", "Premium", "Phoenix"],
    units: ["yards", "complet", "mètre"] as const,
    defaultUnit: "mètre"
  },
  Super: {
    name: "Super",
    subtypes: ["cent", "cachemire", "deux cent", "Indigo", "Toto"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },tulle: {
    name: "Tulle",
    subtypes: [ "doux", "Toto"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },Accessoires: {
    name: "Accessoires",
    subtypes: ["billet", "cachemire", "deux cent", "Indigo", "Toto"],
    units: ["mètre"] as const,
    defaultUnit: "mètre"
  },
  Dentelle: {
    name: "Dentelle",
    subtypes: ["cérémoniev16", "v10", "uni", "guipure", "coton"],
    units: [ "mètre"] as const,
    defaultUnit: "mètre"
  }
} satisfies Record<string, FabricConfigItem>;

// Fonctions utilitaires
export function isFabricType(type: string): type is FabricType {
  return Object.keys(FABRIC_CONFIG).includes(type);
}

export function isFabricSubtype(type: FabricType, subtype: string): boolean {
  return FABRIC_CONFIG[type].subtypes.includes(subtype);
}

export function getFabricUnits(type: FabricType): FabricUnit[] {
  return [...FABRIC_CONFIG[type].units];
}

export function getDefaultUnit(type: FabricType): FabricUnit {
  return FABRIC_CONFIG[type].defaultUnit;
}
export function getAllFabricTypes(): FabricType[] {
  return Object.keys(FABRIC_CONFIG) as FabricType[];
}