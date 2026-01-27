    import Link from "next/link";
    import { cookies } from "next/headers";

    type Props = {
    params: Promise<{ playlistId: string }>;
    };

    export default async function PlaylistPage({ params }: Props) {
    const { playlistId } = await params;

    const cookieStore = (await cookies());
    const cookieHeader = cookieStore
        .getAll()
        .map(c => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/playlists/${playlistId}/items`,
        {
        cache: "no-store",
        headers: { Cookie: cookieHeader },
        }
    );

    if (!res.ok) {
        const text = await res.text();
        console.error("Playlist API failed:", text);
        throw new Error("Failed to load playlist items");
    }

    const { items } = await res.json();

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Playlist</h1>

        {items.length === 0 ? (
            <div className="rounded border border-dashed p-6 text-center text-sm">
            No items in this playlist yet.
            </div>
        ) : (
            <div className="space-y-3">
            {items.map((item: any) => (
                <div key={item.id} className="rounded border p-4">
                {item.title}
                </div>
            ))}
            </div>
        )}
        </div>
    );
    }
