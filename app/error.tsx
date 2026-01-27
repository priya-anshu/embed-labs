    "use client";

    export default function GlobalError({
    error,
    reset,
    }: {
    error: Error;
    reset: () => void;
    }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
            Please try again.
        </p>
        <button
            onClick={reset}
            className="rounded border px-4 py-2 text-sm"
        >
            Retry
        </button>
        </div>
    );
    }
