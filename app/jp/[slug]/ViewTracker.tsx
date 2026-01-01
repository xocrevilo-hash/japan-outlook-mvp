"use client";

import { useEffect } from "react";
import { trackView } from "../../../lib/pageViews";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (slug) trackView(slug);
  }, [slug]);

  return null;
}
