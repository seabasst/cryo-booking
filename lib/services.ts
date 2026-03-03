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
        description: "Helkroppsbehandling i -110°C",
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
        name: "Recovery Ultimate",
        duration: 20,
        price: 200,
        description: "Återhämtningsbyxor",
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
        popular: true,
      },
      {
        id: "deep-tissue-45",
        name: "Deep Tissue 45 min",
        duration: 45,
        price: 900,
      },
      {
        id: "deep-tissue-60",
        name: "Deep Tissue 60 min",
        duration: 60,
        price: 1100,
        popular: true,
      },
      {
        id: "deep-tissue-75",
        name: "Deep Tissue 75 min",
        duration: 75,
        price: 1350,
      },
      {
        id: "deep-tissue-90",
        name: "Deep Tissue 90 min",
        duration: 90,
        price: 1600,
      },
      {
        id: "sportmassage-25",
        name: "Sportmassage 25 min",
        duration: 25,
        price: 500,
      },
      {
        id: "sportmassage-45",
        name: "Sportmassage 45 min",
        duration: 45,
        price: 900,
      },
      {
        id: "sportmassage-60",
        name: "Sportmassage 60 min",
        duration: 60,
        price: 1100,
      },
      {
        id: "sportmassage-75",
        name: "Sportmassage 75 min",
        duration: 75,
        price: 1350,
      },
      {
        id: "sportmassage-90",
        name: "Sportmassage 90 min",
        duration: 90,
        price: 1500,
      },
      {
        id: "svensk-klassisk-25",
        name: "Svensk Klassisk 25 min",
        duration: 25,
        price: 500,
      },
      {
        id: "svensk-klassisk-45",
        name: "Svensk Klassisk 45 min",
        duration: 45,
        price: 900,
      },
      {
        id: "svensk-klassisk-60",
        name: "Svensk Klassisk 60 min",
        duration: 60,
        price: 1100,
      },
      {
        id: "svensk-klassisk-75",
        name: "Svensk Klassisk 75 min",
        duration: 75,
        price: 1350,
      },
      {
        id: "svensk-klassisk-90",
        name: "Svensk Klassisk 90 min",
        duration: 90,
        price: 1500,
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
