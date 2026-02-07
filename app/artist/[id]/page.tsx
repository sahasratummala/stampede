"use client";
import { useParams } from "next/navigation";
import ArtistPublicProfile from "@/app/components/ArtistPublicProfile";

export default function ArtistDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <ArtistPublicProfile userId={id} />;
}