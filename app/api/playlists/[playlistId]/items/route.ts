import { NextRequest, NextResponse } from "next/server";
import { getPlaylistItemsForUserFromRequest } from "@/features/qr/services/read";

type Props = {
  params: Promise<{ playlistId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { playlistId } = await params;

    const items = await getPlaylistItemsForUserFromRequest(
      request,
      playlistId
    );

    return NextResponse.json(
      { success: true, items },
      { status: 200 }
    );
  } catch (error) {
    console.error("Playlist items API error:", error);

    return NextResponse.json(
      { success: false, items: [] },
      { status: 500 }
    );
  }
}
