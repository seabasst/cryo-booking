import Link from "next/link";

export const metadata = {
  title: "Integritetspolicy — FSA Workouts HQ",
};

export default function IntegritetPage() {
  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-fsa-text-muted hover:text-fsa-red mb-6 text-sm"
        >
          ← Tillbaka till bokningen
        </Link>

        <article className="prose prose-invert text-fsa-text">
          <h1 className="text-3xl font-bold mb-2">Integritetspolicy</h1>
          <p className="text-fsa-text-muted mb-8">
            Senast uppdaterad: {new Date().toLocaleDateString("sv-SE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <Section title="1. Personuppgiftsansvarig">
            <p>
              FSA Workouts HQ (org.nr 559329-3672) är personuppgiftsansvarig för
              behandlingen av dina personuppgifter enligt denna policy.
            </p>
            <ul>
              <li>Adress: [FYLL I ADRESS]</li>
              <li>E-post: info@fsaworkouts.se</li>
              <li>Telefon: 08-522 40 740</li>
            </ul>
          </Section>

          <Section title="2. Vilka uppgifter samlar vi in?">
            <p>När du bokar en behandling via vår webbplats samlar vi in:</p>
            <ul>
              <li>Namn</li>
              <li>E-postadress</li>
              <li>Telefonnummer</li>
              <li>Vald behandling, datum och tid</li>
              <li>
                Betalningsinformation — hanteras av Stripe (vi lagrar aldrig
                dina kortuppgifter)
              </li>
            </ul>
          </Section>

          <Section title="3. Varför behandlar vi uppgifterna?">
            <ul>
              <li>
                <strong>Fullgörande av avtal:</strong> för att kunna genomföra
                din bokning och leverera behandlingen
              </li>
              <li>
                <strong>Bokföringsskyldighet:</strong> för att uppfylla svensk
                bokföringslagstiftning
              </li>
              <li>
                <strong>Berättigat intresse:</strong> för att kommunicera
                bekräftelser och påminnelser om din bokning
              </li>
            </ul>
          </Section>

          <Section title="4. Vilka delar vi uppgifter med?">
            <p>
              Vi delar dina uppgifter med följande tredje parter, endast i den
              omfattning som krävs för att fullgöra tjänsten:
            </p>
            <ul>
              <li>
                <strong>Stripe</strong> (betalningsleverantör, USA/EU) — hanterar
                betalning. Se{" "}
                <a
                  href="https://stripe.com/se/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripes integritetspolicy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> (e-postleverantör, EU) — skickar
                bekräftelsemail.
              </li>
              <li>
                <strong>Vercel</strong> (hosting, EU/USA) — driver webbplatsen.
              </li>
              <li>
                <strong>Bokadirekt</strong> (bokningssystem, Sverige) — vi
                överför dina bokningsuppgifter för att blocka tiden i vår
                kalender.
              </li>
            </ul>
          </Section>

          <Section title="5. Hur länge sparar vi dina uppgifter?">
            <ul>
              <li>
                <strong>Bokningsdata:</strong> så länge det behövs för att
                slutföra bokningen, samt som underlag för reklamationer och
                bokföring.
              </li>
              <li>
                <strong>Betalningsuppgifter (via Stripe):</strong> 7 år enligt
                bokföringslagen.
              </li>
              <li>
                <strong>E-postkommunikation:</strong> upp till 3 år.
              </li>
            </ul>
          </Section>

          <Section title="6. Dina rättigheter">
            <p>Enligt GDPR har du rätt att:</p>
            <ul>
              <li>Begära ett registerutdrag över de uppgifter vi har om dig</li>
              <li>Begära rättelse av felaktiga uppgifter</li>
              <li>
                Begära radering av dina uppgifter (i den mån vi inte är
                lagligt skyldiga att behålla dem)
              </li>
              <li>Begära begränsning av behandlingen</li>
              <li>Invända mot behandling som sker på berättigat intresse</li>
              <li>Begära dataportabilitet</li>
            </ul>
            <p>
              Kontakta oss på{" "}
              <a href="mailto:info@fsaworkouts.se">info@fsaworkouts.se</a> om du
              vill utöva någon av dessa rättigheter.
            </p>
            <p>
              Du har också rätt att lämna in klagomål till Integritetsskyddsmyndigheten
              (IMY),{" "}
              <a
                href="https://www.imy.se"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.imy.se
              </a>
              .
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              Vår bokningssida använder endast funktionella cookies som är
              nödvändiga för att bokningsflödet och betalningen ska fungera.
              Vi använder inga marknadsförings- eller spårningscookies.
            </p>
          </Section>

          <Section title="8. Ändringar av denna policy">
            <p>
              Om policyn ändras publiceras den nya versionen på denna sida.
              Vid större förändringar informerar vi tidigare kunder via e-post.
            </p>
          </Section>
        </article>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-fsa-text mt-8 mb-3">{title}</h2>
      <div className="text-fsa-text-muted leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1 [&_a]:text-fsa-red [&_a:hover]:underline [&_strong]:text-fsa-text">
        {children}
      </div>
    </section>
  );
}
