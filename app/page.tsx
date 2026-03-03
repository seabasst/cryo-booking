import BookingWidget from "@/components/BookingWidget";

interface PageProps {
  searchParams: Promise<{ cancelled?: string; kategori?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const cancelled = params.cancelled === "true";
  const initialCategory = params.kategori;

  return (
    <main className="min-h-screen py-8 px-4">
      {/* Hero Section */}
      <div className="max-w-md mx-auto text-center mb-8">
        {/* Logo/Brand */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-fsa-text mb-2 tracking-tight">
            FSA WORKOUTS
          </h1>
          <p className="text-fsa-text-muted text-sm uppercase tracking-widest">
            Recovery & Performance
          </p>
        </div>

        {/* Tagline */}
        <p className="text-fsa-text-muted">
          Boka din behandling online – snabbt, enkelt och utan konto.
        </p>
      </div>

      {/* Booking Widget */}
      <BookingWidget cancelled={cancelled} initialCategory={initialCategory} />

      {/* Trust Badges */}
      <div className="max-w-md mx-auto mt-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-fsa-gray border border-fsa-gray-light">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-fsa-red/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-fsa-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-xs text-fsa-text-muted">Säker betalning</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-fsa-gray border border-fsa-gray-light">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-fsa-red/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-fsa-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-xs text-fsa-text-muted">Direkt bekräftelse</p>
          </div>

          <div className="text-center p-3 rounded-lg bg-fsa-gray border border-fsa-gray-light">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-fsa-red/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-fsa-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-xs text-fsa-text-muted">Fri avbokning</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-md mx-auto mt-12 text-center text-fsa-text-dim text-xs">
        <p>&copy; {new Date().getFullYear()} FSA Workouts HQ</p>
      </footer>
    </main>
  );
}
