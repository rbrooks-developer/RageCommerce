export type Country = {
  code: string;
  name: string;
  hasSubdivisions: boolean;
};

export type Subdivision = {
  code: string;
  name: string;
};

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States",        hasSubdivisions: true  },
  { code: "CA", name: "Canada",               hasSubdivisions: true  },
  { code: "AU", name: "Australia",            hasSubdivisions: true  },
  { code: "MX", name: "Mexico",               hasSubdivisions: true  },
  { code: "GB", name: "United Kingdom",       hasSubdivisions: false },
  { code: "IE", name: "Ireland",              hasSubdivisions: false },
  { code: "NZ", name: "New Zealand",          hasSubdivisions: false },
  { code: "DE", name: "Germany",              hasSubdivisions: false },
  { code: "FR", name: "France",               hasSubdivisions: false },
  { code: "IT", name: "Italy",                hasSubdivisions: false },
  { code: "ES", name: "Spain",                hasSubdivisions: false },
  { code: "PT", name: "Portugal",             hasSubdivisions: false },
  { code: "NL", name: "Netherlands",          hasSubdivisions: false },
  { code: "BE", name: "Belgium",              hasSubdivisions: false },
  { code: "AT", name: "Austria",              hasSubdivisions: false },
  { code: "CH", name: "Switzerland",          hasSubdivisions: false },
  { code: "SE", name: "Sweden",               hasSubdivisions: false },
  { code: "NO", name: "Norway",               hasSubdivisions: false },
  { code: "DK", name: "Denmark",              hasSubdivisions: false },
  { code: "FI", name: "Finland",              hasSubdivisions: false },
  { code: "PL", name: "Poland",               hasSubdivisions: false },
  { code: "CZ", name: "Czech Republic",       hasSubdivisions: false },
  { code: "JP", name: "Japan",                hasSubdivisions: false },
  { code: "KR", name: "South Korea",          hasSubdivisions: false },
  { code: "SG", name: "Singapore",            hasSubdivisions: false },
  { code: "HK", name: "Hong Kong",            hasSubdivisions: false },
  { code: "IN", name: "India",                hasSubdivisions: false },
  { code: "BR", name: "Brazil",               hasSubdivisions: false },
  { code: "ZA", name: "South Africa",         hasSubdivisions: false },
];

export const SUBDIVISIONS: Record<string, Subdivision[]> = {
  US: [
    { code: "AL", name: "Alabama" },           { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },           { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },        { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },       { code: "DE", name: "Delaware" },
    { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },           { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },             { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },           { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },            { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },         { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },          { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },          { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },       { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },           { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },            { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },        { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },          { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },      { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },          { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },      { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },         { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },              { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },          { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },     { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
  ],
  CA: [
    { code: "AB", name: "Alberta" },
    { code: "BC", name: "British Columbia" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
    { code: "ON", name: "Ontario" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "QC", name: "Quebec" },
    { code: "SK", name: "Saskatchewan" },
    { code: "YT", name: "Yukon" },
  ],
  AU: [
    { code: "ACT", name: "Australian Capital Territory" },
    { code: "NSW", name: "New South Wales" },
    { code: "NT",  name: "Northern Territory" },
    { code: "QLD", name: "Queensland" },
    { code: "SA",  name: "South Australia" },
    { code: "TAS", name: "Tasmania" },
    { code: "VIC", name: "Victoria" },
    { code: "WA",  name: "Western Australia" },
  ],
  MX: [
    { code: "AGU", name: "Aguascalientes" },      { code: "BCN", name: "Baja California" },
    { code: "BCS", name: "Baja California Sur" }, { code: "CAM", name: "Campeche" },
    { code: "CHP", name: "Chiapas" },             { code: "CHH", name: "Chihuahua" },
    { code: "CMX", name: "Ciudad de México" },    { code: "COA", name: "Coahuila" },
    { code: "COL", name: "Colima" },              { code: "DUR", name: "Durango" },
    { code: "GUA", name: "Guanajuato" },          { code: "GRO", name: "Guerrero" },
    { code: "HID", name: "Hidalgo" },             { code: "JAL", name: "Jalisco" },
    { code: "MEX", name: "Mexico State" },        { code: "MIC", name: "Michoacán" },
    { code: "MOR", name: "Morelos" },             { code: "NAY", name: "Nayarit" },
    { code: "NLE", name: "Nuevo León" },          { code: "OAX", name: "Oaxaca" },
    { code: "PUE", name: "Puebla" },              { code: "QUE", name: "Querétaro" },
    { code: "ROO", name: "Quintana Roo" },        { code: "SLP", name: "San Luis Potosí" },
    { code: "SIN", name: "Sinaloa" },             { code: "SON", name: "Sonora" },
    { code: "TAB", name: "Tabasco" },             { code: "TAM", name: "Tamaulipas" },
    { code: "TLA", name: "Tlaxcala" },            { code: "VER", name: "Veracruz" },
    { code: "YUC", name: "Yucatán" },             { code: "ZAC", name: "Zacatecas" },
  ],
};

export function getCountryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}

export function getSubdivisionLabel(countryCode: string): string {
  if (countryCode === "CA") return "Province / Territory";
  if (countryCode === "AU") return "State / Territory";
  if (countryCode === "MX") return "State";
  return "State";
}
