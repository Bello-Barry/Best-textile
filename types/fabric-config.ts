export const FABRIC_CONFIG = {
  gabardine: {
    name: "Gabardine",
    subtypes: Array.from({ length: 12 }, (_, i) => `Type ${i + 1}`),
    units: ["mètre", "rouleau"],
    defaultUnit: "mètre"
  },
  bazin: {
    name: "Bazin",
    subtypes: ["Riche", "Getzner", "Superfanga", "Doré", "Impérial"],
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
    subtypes: ["Adweneasa", "Sika Futuro", "Oyokoman", "Traditionnel", "Babadua"],
    units: ["mètre"],
    defaultUnit: "mètre"
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
    units: [ "mètre"],
    defaultUnit: "mètre"
  },
  moustiquaire: {
    name: "Moustiquaire",
    subtypes: ["Simple", "Brodée", "Renforcée", "Colorée"],
    units: ["mètre"],
    defaultUnit: "mètre"
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
    units: [ "mètre"],
    defaultUnit: "mètre"
  },
  dashiki: {
    name: "Dashiki",
    subtypes: ["Classique", "Brodé", "Angelina", "Festif", "Royal"],
    units: ["mètre"],
    defaultUnit: "mètre"
  },
  adire: {
    name: "Adire",
    subtypes: ["Eleko", "Alabere", "Oniko", "Batik", "Moderne"],
    units: [ "mètre"],
    defaultUnit: "mètre"
  },
  ankara: {
    name: "Ankara",
    subtypes: ["Hollandais", "Hitarget", "ABC", "Premium", "Phoenix"],
    units: ["mètre"],
    defaultUnit: "mètre"
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

export function getFabricUnits(type: FabricType): readonly string[] {
  return FABRIC_CONFIG[type].units;
}

export function getDefaultUnit(type: FabricType): string {
  return FABRIC_CONFIG[type].defaultUnit;
}

export function getAllFabricTypes(): FabricType[] {
  return Object.keys(FABRIC_CONFIG) as FabricType[];
}

export function getFabricSubtypes(type: FabricType): readonly string[] {
  return FABRIC_CONFIG[type].subtypes;
}
