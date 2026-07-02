import { getSettings } from "@/lib/data/settings";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import type { TrackingConfig } from "@/types";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const settings = await getSettings();
  const tracking = settings?.tracking_config as TrackingConfig | null;
  const lookerStudioUrl = tracking?.looker_studio_url ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Google Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Embedded Looker Studio dashboard connected to your GA4 property.
        </p>
      </div>
      <AnalyticsDashboard lookerStudioUrl={lookerStudioUrl} />
    </div>
  );
}
