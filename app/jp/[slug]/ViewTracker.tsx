"use client";

import { useEffect } from "react";
import { trackView } from "../../../lib/pageViews";

export default function ViewTracker({
  slug,
  ticker,
}: {
  slug: string;
  ticker?: string;
}) {
  useEffect(() => {
    trackView(ticker ?? slug);
  }, [slug, ticker]);

  return null;
}
