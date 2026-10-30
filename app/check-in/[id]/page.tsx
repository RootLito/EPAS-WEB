"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import GuestCheckInForm from "@/app/components/check-in/GuestCheckInForm";
import GuestCheckInSkeleton from "@/app/components/check-in/GuestCheckInSkeleton";

function GuestCheckInWrapper() {
  const params = useParams();
  const eventId = params.id as string;

  return <GuestCheckInForm eventId={eventId} />;
}

export default function GuestCheckInPage() {
  return (
    <Suspense fallback={<GuestCheckInSkeleton />}>
      <GuestCheckInWrapper />
    </Suspense>
  );
}
