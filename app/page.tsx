import BookingWidget from "@/components/BookingWidget";

interface PageProps {
  searchParams: Promise<{ cancelled?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const cancelled = params.cancelled === "true";

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-fsa-text mb-2 tracking-tight">
            Boka behandling
          </h1>
          <p className="text-fsa-text-muted text-sm sm:text-base">
            Välj din behandling, tid och betala – allt online.
          </p>
        </div>

        {/* Booking Widget */}
        <BookingWidget cancelled={cancelled} />

        {/* Footer */}
        <footer className="mt-16 text-center text-fsa-text-dim text-xs">
          <p>&copy; {new Date().getFullYear()} FSA Workouts HQ</p>
        </footer>
      </div>
    </main>
  );
}
