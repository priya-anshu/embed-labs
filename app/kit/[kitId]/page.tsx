    import Link from "next/link";
    import { cookies } from "next/headers";

    type Props = {
    params: Promise<{ kitId: string }>;
    };

    export default async function KitPage({ params }: Props) {
    const { kitId } = await params;

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/kits/${kitId}/playlists`,
        {
        cache: "no-store",
        headers: {
            Cookie: cookieHeader,
        },
        }
    );

    if (!res.ok) {
        throw new Error("Failed to load playlists");
    }

    const data = await res.json();
    const playlists = data.playlists ?? [];

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
            <h1 className="text-2xl font-semibold">Kit</h1>
            <p className="text-sm text-muted-foreground">
            Available playlists for this kit
            </p>
        </div>

        {playlists.length === 0 ? (
            <div className="rounded border border-dashed p-6 text-center text-sm text-muted-foreground">
            No playlists available for this kit.
            </div>
        ) : (
            <div className="grid gap-4 sm:grid-cols-2">
            {playlists.map((pl: { id: string; name: string }) => (
                <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className="rounded-lg border bg-card p-5 hover:bg-muted"
                >
                <h3 className="font-medium">{pl.name}</h3>
                <p className="text-sm text-muted-foreground">View playlist</p>
                </Link>
            ))}
            </div>
        )}
        </div>
    );
    }
