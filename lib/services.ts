import type { ServiceCategory } from "./types";

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
