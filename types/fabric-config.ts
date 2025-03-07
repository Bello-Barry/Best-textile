export const FABRIC_CONFIG = {
  gabardine: {
    name: "Gabardine",
    subtypes: Array.from({ length: 12 }, (_, i) => `Type ${i + 1}`),
    units: ["mètre", "rouleau"],
    defaultUnit: "mètre"
  },
  bazin: {
    name: "Bazin",
    subtypes: ["Riche", "Getzner", "SuperFanga", "Doré", "Impérial"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  soie: {
    name: "Soie",
    subtypes: ["Uni", "plissée", "fleurie ", "Bazin ", "brodé"],
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
    subtypes: ["De Paris", "Duchesse", "riche ", "Coton"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  kente: {
    name: "Kente",
    subtypes: ["Adweneasa", "Sika Futuro", "pagne", "traditionnel", "Babadua"],
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
    subtypes: ["Wax", "Super Wax", "kinte", "Java", "Woodin", "Vlisco"],
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

// Définitions de types plus sûres qui fonctionnent mieux en runtime
export type FabricType = string;
export type FabricSubtype = string;
export type FabricUnit = string;

// Fonctions de validation plus robustes avec vérifications supplémentaires
export function isFabricType(type: string): boolean {
  if (!type || typeof type !== 'string') return false;
  return Object.prototype.hasOwnProperty.call(FABRIC_CONFIG, type);
}

export function isFabricSubtype(type: string, subtype: string): boolean {
  if (!type || !subtype || typeof type !== 'string' || typeof subtype !== 'string') return false;
  if (!isFabricType(type)) return false;
  
  try {
    // Utilisation de la vérification with try/catch pour éviter les erreurs
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

// Fonction d'aide pour obtenir le nom complet d'un tissu
export function getFabricName(type: string): string {
  if (!type || typeof type !== 'string') return "";
  if (!isFabricType(type)) return type; // Retourne le type tel quel si non trouvé
  
  try {
    return FABRIC_CONFIG[type].name || type;
  } catch (error) {
    console.error("Error getting fabric name:", error);
    return type;
  }
}

// Fonction pour vérifier si une unité est valide pour un type de tissu
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