import Link from "next/link";

export const metadata = {
  title: "Köpvillkor — FSA Workouts HQ",
};

export default function VillkorPage() {
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
          <h1 className="text-3xl font-bold mb-2">Köpvillkor</h1>
          <p className="text-fsa-text-muted mb-8">
            Senast uppdaterad: {new Date().toLocaleDateString("sv-SE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <Section title="1. Företagsuppgifter">
            <p>
              FSA Workouts HQ, org.nr 559329-3672
              <br />
              Adress: [FYLL I ADRESS]
              <br />
              E-post: info@fsaworkouts.se
              <br />
              Telefon: 08-522 40 740
            </p>
          </Section>

          <Section title="2. Tjänster och priser">
            <p>
              Vi tillhandahåller återhämtnings- och massagetjänster som bokas
              och betalas i förskott via vår webbplats. Priser anges i svenska
              kronor och inkluderar moms.
            </p>
            <p>
              Aktuella priser visas alltid i bokningsflödet. Vi förbehåller oss
              rätten att ändra priser utan förvarning, men det pris som gäller
              är alltid det som visas vid tidpunkten för bokningen.
            </p>
          </Section>

          <Section title="3. Bokning och betalning">
            <p>
              Bokning sker via vårt bokningsformulär på webbplatsen. Betalning
              görs direkt i samband med bokningen via Stripe. Vi accepterar
              betalning med kort.
            </p>
            <p>
              Bokningen är bindande från det ögonblick betalningen har gått
              igenom. En bekräftelse skickas till den e-postadress du angett.
            </p>
          </Section>

          <Section title="4. Ångerrätt">
            <p>
              Enligt distansavtalslagen (2005:59) 2 kap 11 § gäller ångerrätten
              i 14 dagar för distansköp. För tidsbestämda tjänster som utförs
              vid en specifik tidpunkt gäller dock undantag: när du bokar och
              betalar en behandling samtycker du samtidigt till att tjänsten
              börjar utföras (planeras och tiden reserveras) före ångerfristens
              utgång — och därmed upphör ångerrätten.
            </p>
            <p>
              Om du ändå vill avboka gäller våra avbokningsvillkor nedan.
            </p>
          </Section>

          <Section title="5. Avbokning och ombokning">
            <p>
              <strong>Mer än 24 timmar innan bokad tid:</strong> full
              återbetalning eller ombokning utan avgift.
            </p>
            <p>
              <strong>Mindre än 24 timmar innan bokad tid:</strong> ingen
              återbetalning. Ombokning i mån av plats.
            </p>
            <p>
              <strong>Uteblivet besök (no-show):</strong> hela beloppet
              debiteras.
            </p>
            <p>
              Avbokning görs genom att kontakta oss på{" "}
              <a href="mailto:info@fsaworkouts.se">info@fsaworkouts.se</a> eller
              via telefon senast 24 timmar innan bokad tid.
            </p>
          </Section>

          <Section title="6. Klippkort och paketköp">
            <p>
              Klippkort (t.ex. 10-kort) gäller i 12 månader från köpdatum om
              inget annat angetts. Outnyttjade behandlingar återbetalas inte
              efter giltighetstidens utgång.
            </p>
          </Section>

          <Section title="7. Reklamation">
            <p>
              Vi strävar efter att alla behandlingar utförs med hög kvalitet.
              Om du inte är nöjd med utförd tjänst — kontakta oss inom 14
              dagar på{" "}
              <a href="mailto:info@fsaworkouts.se">info@fsaworkouts.se</a> så
              försöker vi hitta en lösning.
            </p>
          </Section>

          <Section title="8. Force majeure">
            <p>
              Vid händelser utanför vår kontroll (sjukdom hos behandlare,
              tekniskt fel, naturkatastrof m.m.) förbehåller vi oss rätten att
              ställa in eller flytta bokningar. Full återbetalning erbjuds om
              tjänsten inte kan utföras.
            </p>
          </Section>

          <Section title="9. Personuppgifter">
            <p>
              Läs vår{" "}
              <Link href="/integritet">integritetspolicy</Link> för information
              om hur vi behandlar dina personuppgifter i samband med bokning
              och betalning.
            </p>
          </Section>

          <Section title="10. Tvistlösning">
            <p>
              Vi följer beslut från Allmänna reklamationsnämnden (ARN). Om
              tvist inte kan lösas i samförstånd hänvisar vi till ARN,{" "}
              <a
                href="https://www.arn.se"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.arn.se
              </a>
              , eller allmän domstol.
            </p>
          </Section>

          <Section title="11. Ändringar">
            <p>
              Dessa villkor kan komma att ändras. Den version som gällde vid
              tidpunkten för din bokning är den som är tillämplig för det köpet.
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
      <div className="text-fsa-text-muted leading-relaxed space-y-3 [&_a]:text-fsa-red [&_a:hover]:underline [&_strong]:text-fsa-text">
        {children}
      </div>
    </section>
  );
}
