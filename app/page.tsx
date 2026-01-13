/**
 * Home page - landing page for embedLabs.
 * 
 * This is a placeholder page. The actual landing page will be
 * implemented when the UI design is finalized.
 */

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <main className="flex flex-col items-center gap-8 px-8 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          EmbedLabs
        </h1>
        <p className="max-w-md text-lg leading-8 text-muted-foreground">
          Online education platform with QR-based permanent access binding
        </p>
      </main>
    </div>
  );
}
