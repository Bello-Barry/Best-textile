// Définition explicite du type d'objet de configuration pour aider TypeScript
export interface FabricConfigItem {
  name: string;
  subtypes: string[];
  units: string[];
  defaultUnit: string;
}

export interface FabricConfigType {
  [key: string]: FabricConfigItem;
}

// La configuration avec l'interface explicite pour permettre l'indexation par string
export const FABRIC_CONFIG: FabricConfigType = {
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
  },
  kente: {
    name: "Kente",
    subtypes: ["Adweneasa", "Sika Futuro", "Oyokoman", "Asasia", "Babadua"],
    units: ["pièce", "mètre"],
    defaultUnit: "pièce"
  },
  lin: {
    name: "Lin",
    subtypes: ["Naturel", "Lavé", "Mélangé", "Brodé", "Fin"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  mousseline: {
    name: "Mousseline",
    subtypes: ["De soie", "De coton", "Brodée", "Imprimée", "Légère"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  pagne: {
    name: "Pagne",
    subtypes: ["Wax", "Super Wax", "Fancy", "Java", "Woodin", "Vlisco"],
    units: ["complet", "yards", "mètre"],
    defaultUnit: "complet"
  },
  moustiquaire: {
    name: "Moustiquaire",
    subtypes: ["Simple", "Brodée", "Renforcée", "Colorée"],
    units: ["pièce", "mètre"],
    defaultUnit: "pièce"
  },
  brocart: {
    name: "Brocart",
    subtypes: ["Damassé", "Jacquard", "Métallique", "Relief", "Traditionnel"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  bogolan: {
    name: "Bogolan",
    subtypes: ["Traditionnel", "Moderne", "Bamanan", "Ségovien", "Minianka"],
    units: ["bande", "mètre"],
    defaultUnit: "bande"
  },
  dashiki: {
    name: "Dashiki",
    subtypes: ["Classique", "Brodé", "Angelina", "Festif", "Royal"],
    units: ["pièce"],
    defaultUnit: "pièce"
  },
  adire: {
    name: "Adire",
    subtypes: ["Eleko", "Alabere", "Oniko", "Batik", "Moderne"],
    units: ["yard", "mètre"],
    defaultUnit: "yard"
  },
  ankara: {
    name: "Ankara",
    subtypes: ["Hollandais", "Hitarget", "ABC", "Premium", "Phoenix"],
    units: ["yards", "complet", "mètre"],
    defaultUnit: "complet"
  },
  shweshwe: {
    name: "Shweshwe",
    subtypes: ["Three Cats", "Da Gama", "Spruce", "Indigo", "Toto"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  aso_oke: {
    name: "Aso-oke",
    subtypes: ["Sanyan", "Alaari", "Etu", "Petuje", "Olowu"],
    units: ["set", "mètre"],
    defaultUnit: "set"
  }
};

// Types exportés
export type FabricType = string;
export type FabricSubtype = string;
export type FabricUnit = string;

// Fonctions de validation optimisées pour TypeScript
export function isFabricType(type: string): boolean {
  if (!type || typeof type !== 'string') return false;
  return Object.prototype.hasOwnProperty.call(FABRIC_CONFIG, type);
}

export function isFabricSubtype(type: string, subtype: string): boolean {
  if (!type || !subtype || typeof type !== 'string' || typeof subtype !== 'string') return false;
  if (!isFabricType(type)) return false;
  
  try {
    return FABRIC_CONFIG[type]?.subtypes?.includes(subtype) || false;
  } catch (error) {
    console.error("Error checking fabric subtype:", error);
    return false;
  }
}

export function getFabricUnits(type: string): string[] {
  if (!type || typeof type !== 'string') return [];
  if (!isFabricType(type)) return [];
  
  try {
    return [...FABRIC_CONFIG[type].units];
  } catch (error) {
    console.error("Error getting fabric units:", error);
    return [];
  }
}

export function getDefaultUnit(type: string): string {
  if (!type || typeof type !== 'string') return "mètre";
  if (!isFabricType(type)) return "mètre";
  
  try {
    return FABRIC_CONFIG[type].defaultUnit || "mètre";
  } catch (error) {
    console.error("Error getting default unit:", error);
    return "mètre";
  }
}

export function getAllFabricTypes(): string[] {
  try {
    return Object.keys(FABRIC_CONFIG);
  } catch (error) {
    console.error("Error getting all fabric types:", error);
    return [];
  }
}

export function getFabricSubtypes(type: string): string[] {
  if (!type || typeof type !== 'string') return [];
  if (!isFabricType(type)) return [];
  
  try {
    return [...FABRIC_CONFIG[type].subtypes];
  } catch (error) {
    console.error("Error getting fabric subtypes:", error);
    return [];
  }
}

export function getFabricName(type: string): string {
  if (!type || typeof type !== 'string') return "";
  if (!isFabricType(type)) return type;
  
  try {
    return FABRIC_CONFIG[type].name || type;
  } catch (error) {
    console.error("Error getting fabric name:", error);
    return type;
  }
}

export function isValidUnit(type: string, unit: string): boolean {
  if (!type || !unit || typeof type !== 'string' || typeof unit !== 'string') return false;
  if (!isFabricType(type)) return false;
  
  try {
    return FABRIC_CONFIG[type].units.includes(unit);
  } catch (error) {
    console.error("Error checking valid unit:", error);
    return false;
  }
}

// Fonction de sécurité pour accéder aux propriétés de configuration
export function getFabricConfig(type: string): FabricConfigItem | null {
  if (!type || !isFabricType(type)) return null;
  return FABRIC_CONFIG[type] || null;
}

// Fonction pour obtenir l'unité par défaut de manière sécurisée
export function getSafeDefaultUnit(type: string): string {
  const config = getFabricConfig(type);
  return config?.defaultUnit || "mètre";
}