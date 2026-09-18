"use client";
export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="onboarding-shell">
      <h1>Let’s try that again.</h1>
      <p>We couldn’t load your roadmap. Please try again in a moment.</p>
      <button className="easy-button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
