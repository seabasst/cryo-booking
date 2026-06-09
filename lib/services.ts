import type { Service, ServiceCategory, TreatmentFamily } from "./types";

// ============================================
// FSA Workouts HQ - Behandlingar
// ============================================

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "terapi",
    name: "Terapi",
    icon: "❄️",
    services: [
      {
        id: "kryoterapi-10",
        name: "Kryoterapi",
        duration: 10,
        price: 150,
        description: "Helkroppsbehandling i -87°C",
        popular: true,
      },
      {
        id: "kryoterapi-klippkort-5",
        name: "Kryoterapi 5-kort",
        duration: 10,
        price: 600,
        description: "5 behandlingar",
      },
      {
        id: "kryoterapi-klippkort-10",
        name: "Kryoterapi 10-kort",
        duration: 10,
        price: 900,
        description: "10 behandlingar",
      },
      {
        id: "rodljusterapi",
        name: "Rödljusterapi",
        duration: 10,
        price: 200,
        description: "Stimulerar cellförnyelse",
      },
      {
        id: "rodljus-10kort",
        name: "Rödljus 10-kort",
        duration: 10,
        price: 1000,
        description: "10 behandlingar",
      },
      {
        id: "recovery-ultimate",
        name: "Compression Therapy",
        duration: 20,
        price: 200,
        description:
          "Kompressionsbyxor – boostar återhämtningen, blodcirkulationen och tar bort slaggprodukter",
      },
    ],
  },
  {
    id: "massage",
    name: "Massage",
    icon: "💆",
    services: [
      {
        id: "deep-tissue-25",
        name: "Deep Tissue 25 min",
        duration: 25,
        price: 500,
        description:
          "Djupgående anti-inflammatorisk massage – utökar rörligheten och tar bort spänningar",
        popular: true,
      },
      {
        id: "deep-tissue-45",
        name: "Deep Tissue 45 min",
        duration: 45,
        price: 900,
        description:
          "Djupgående anti-inflammatorisk massage – utökar rörligheten och tar bort spänningar",
      },
      {
        id: "deep-tissue-60",
        name: "Deep Tissue 60 min",
        duration: 60,
        price: 1100,
        description:
          "Djupgående anti-inflammatorisk massage – utökar rörligheten och tar bort spänningar",
        popular: true,
      },
      {
        id: "deep-tissue-75",
        name: "Deep Tissue 75 min",
        duration: 75,
        price: 1350,
        description:
          "Djupgående anti-inflammatorisk massage – utökar rörligheten och tar bort spänningar",
      },
      {
        id: "deep-tissue-90",
        name: "Deep Tissue 90 min",
        duration: 90,
        price: 1600,
        description:
          "Djupgående anti-inflammatorisk massage – utökar rörligheten och tar bort spänningar",
      },
      {
        id: "sportmassage-25",
        name: "Sportmassage 25 min",
        duration: 25,
        price: 500,
        description:
          "Funktionell massage för att utöka performance – inkl. koppning",
      },
      {
        id: "sportmassage-45",
        name: "Sportmassage 45 min",
        duration: 45,
        price: 900,
        description:
          "Funktionell massage för att utöka performance – inkl. koppning",
      },
      {
        id: "sportmassage-60",
        name: "Sportmassage 60 min",
        duration: 60,
        price: 1100,
        description:
          "Funktionell massage för att utöka performance – inkl. koppning",
      },
      {
        id: "sportmassage-75",
        name: "Sportmassage 75 min",
        duration: 75,
        price: 1350,
        description:
          "Funktionell massage för att utöka performance – inkl. koppning",
      },
      {
        id: "sportmassage-90",
        name: "Sportmassage 90 min",
        duration: 90,
        price: 1500,
        description:
          "Funktionell massage för att utöka performance – inkl. koppning",
      },
      {
        id: "svensk-klassisk-25",
        name: "Svensk Klassisk 25 min",
        duration: 25,
        price: 500,
        description: "Klassiska massagegrepp – tar bort spänningar",
      },
      {
        id: "svensk-klassisk-45",
        name: "Svensk Klassisk 45 min",
        duration: 45,
        price: 900,
        description: "Klassiska massagegrepp – tar bort spänningar",
      },
      {
        id: "svensk-klassisk-60",
        name: "Svensk Klassisk 60 min",
        duration: 60,
        price: 1100,
        description: "Klassiska massagegrepp – tar bort spänningar",
      },
      {
        id: "svensk-klassisk-75",
        name: "Svensk Klassisk 75 min",
        duration: 75,
        price: 1350,
        description: "Klassiska massagegrepp – tar bort spänningar",
      },
      {
        id: "svensk-klassisk-90",
        name: "Svensk Klassisk 90 min",
        duration: 90,
        price: 1500,
        description: "Klassiska massagegrepp – tar bort spänningar",
      },
      {
        id: "muskelkonsultation",
        name: "Muskelkonsultation",
        duration: 45,
        price: 499,
        description: "Analys och behandlingsplan",
      },
    ],
  },
  {
    id: "insculpt",
    name: "Insculpt",
    icon: "⚡",
    services: [
      {
        id: "insculpt-kampanj",
        name: "Insculpt - KAMPANJ",
        duration: 45,
        price: 499,
        description: "Muskelbyggande & fettreducering",
        popular: true,
      },
      {
        id: "insculpt-45",
        name: "Insculpt",
        duration: 45,
        price: 1300,
        description: "Muskelbyggande & fettreducering",
      },
      {
        id: "insculpt-10kort",
        name: "Insculpt 10 behandlingar",
        duration: 45,
        price: 6500,
      },
      {
        id: "insculpt-20kort",
        name: "Insculpt 20 behandlingar",
        duration: 45,
        price: 12000,
      },
      {
        id: "insculpt-chair-kampanj",
        name: "Insculpt Chair - KAMPANJ",
        duration: 40,
        price: 499,
        description: "Bäckenbottenträning",
        popular: true,
      },
      {
        id: "insculpt-chair",
        name: "Insculpt Chair",
        duration: 40,
        price: 1350,
        description: "Bäckenbottenträning",
      },
    ],
  },
  {
    id: "traning",
    name: "Träning",
    icon: "💪",
    services: [
      {
        id: "inbody",
        name: "InBody Mätning",
        duration: 10,
        price: 250,
        description: "Kroppsanalys",
        popular: true,
      },
      {
        id: "recovery-activate",
        name: "Recovery Activate",
        duration: 30,
        price: 900,
        description: "Aktiv återhämtning",
      },
    ],
  },
];

// ============================================
// Treatment Families (landing page cards)
// ============================================

export const TREATMENT_FAMILIES: TreatmentFamily[] = [
  {
    id: "kryoterapi",
    name: "Kryoterapi",
    image:
      "https://images.squarespace-cdn.com/content/v1/66def6493457365fcadf9c12/4073ffa1-1379-40dc-9c5b-20e6696c6c07/cryokammare.jpg",
    description:
      "Helkroppsbehandling i -87°C. Tre minuter i kryokammaren stärker hälsan genom kontrollerad kylexponering och påskyndar muskelåterhämtningen efter träning.",
    priceText: "1x 150 kr  ·  5-kort 600 kr  ·  10-kort 900 kr",
    serviceIds: [
      "kryoterapi-10",
      "kryoterapi-klippkort-5",
      "kryoterapi-klippkort-10",
    ],
  },
  {
    id: "rodljus",
    name: "Rödljusterapi",
    image:
      "https://images.squarespace-cdn.com/content/v1/66def6493457365fcadf9c12/5274583b-cb0e-4780-bc25-cb3ee7b2eab6/ro%CC%88dljusterapi.jpg",
    description:
      "Rödljus stimulerar cellförnyelse och hjälper hud och muskelvävnad att läka. Låg värme, skadar inte huden.",
    priceText: "1x 200 kr  ·  10-kort 1000 kr",
    serviceIds: ["rodljusterapi", "rodljus-10kort"],
  },
  {
    id: "kompression",
    name: "Compression Therapy",
    image:
      "https://images.squarespace-cdn.com/content/v1/66def6493457365fcadf9c12/e56f38ad-18d1-408c-b954-959cd1ee6c0b/fsa.jpg",
    description:
      "Kompressionsbyxor som boostar återhämtningen, blodcirkulationen och tar bort slaggprodukter. Vanlig behandling efter match eller hård träning.",
    priceText: "1x 200 kr",
    serviceIds: ["recovery-ultimate"],
  },
  {
    id: "insculpt-chair",
    name: "Insculpt Chair",
    image:
      "https://images.squarespace-cdn.com/content/v1/66def6493457365fcadf9c12/639010df-6cd9-464c-965b-576e58dc57d4/insculpt+chair+fsa.jpg",
    description:
      "Elektromagnetisk behandling för bäckenbotten. 28 minuter som utför tusentals sammandragningar — helt icke-invasivt.",
    priceText: "KAMPANJ 499 kr  ·  1x 1350 kr",
    serviceIds: ["insculpt-chair-kampanj", "insculpt-chair"],
  },
  {
    id: "massage",
    name: "Massage",
    image:
      "https://images.squarespace-cdn.com/content/v1/66def6493457365fcadf9c12/b60d0e3c-28f4-4fac-827c-9c5823add68b/massage+studo+stockholm.jpg",
    description:
      "Deep tissue, sportmassage och klassisk svensk massage — för både vardagsmotionärer och elitidrottare. Inkluderar koppning vid behov.",
    priceText: "25 min 500 kr  ·  45 min 900 kr  ·  60 min 1100 kr",
    serviceIds: [
      "deep-tissue-25",
      "deep-tissue-45",
      "deep-tissue-60",
      "deep-tissue-75",
      "deep-tissue-90",
      "sportmassage-25",
      "sportmassage-45",
      "sportmassage-60",
      "sportmassage-75",
      "sportmassage-90",
      "svensk-klassisk-25",
      "svensk-klassisk-45",
      "svensk-klassisk-60",
      "svensk-klassisk-75",
      "svensk-klassisk-90",
      "muskelkonsultation",
    ],
  },
  {
    id: "insculpt",
    name: "Insculpt",
    image:
      "https://images.squarespace-cdn.com/content/v1/66def6493457365fcadf9c12/55c40468-fac4-4101-ad00-c57057e1c374/fsa_insculpt.jpg",
    description:
      "Stimulerar muskelsammandragning för fettförlust på envisa områden runt mage och skinkor. Bra för att återaktivera djupare kärnmuskler efter förlossning.",
    priceText: "KAMPANJ 499 kr  ·  1x 1300 kr  ·  10x 6500 kr",
    serviceIds: [
      "insculpt-kampanj",
      "insculpt-45",
      "insculpt-10kort",
      "insculpt-20kort",
    ],
  },
];

export function getTreatmentFamilyById(familyId: string) {
  return TREATMENT_FAMILIES.find((f) => f.id === familyId);
}

export function getServicesForFamily(familyId: string): Service[] {
  const family = getTreatmentFamilyById(familyId);
  if (!family) return [];
  const all: Service[] = [];
  for (const category of SERVICE_CATEGORIES) {
    for (const service of category.services) {
      if (family.serviceIds.includes(service.id)) {
        all.push(service);
      }
    }
  }
  return all;
}

// ============================================
// Helper functions
// ============================================

export function getServiceById(serviceId: string) {
  for (const category of SERVICE_CATEGORIES) {
    const service = category.services.find((s) => s.id === serviceId);
    if (service) {
      return { service, category };
    }
  }
  return null;
}

export function getCategoryById(categoryId: string) {
  return SERVICE_CATEGORIES.find((c) => c.id === categoryId);
}

export function getPopularServices() {
  const popular: Array<{ service: typeof SERVICE_CATEGORIES[0]["services"][0]; category: ServiceCategory }> = [];

  for (const category of SERVICE_CATEGORIES) {
    for (const service of category.services) {
      if (service.popular) {
        popular.push({ service, category });
      }
    }
  }

  return popular;
}
