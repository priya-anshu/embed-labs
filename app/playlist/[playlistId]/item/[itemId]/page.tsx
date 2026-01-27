    type Props = {
    params: { playlistId: string; itemId: string };
    };

    export default function ItemPage({ params }: Props) {
    return (
        <div className="mx-auto max-w-3xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold">Item</h1>

        <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">
            Playlist: {params.playlistId}
            </p>
            <p className="mt-2">Item ID: {params.itemId}</p>

            <div className="mt-6 rounded border border-dashed p-6 text-center">
            Content will appear here
            </div>
        </div>
        </div>
    );
    }
