"use client";

import { useActionState, useState } from "react";
import { saveAnalyticsSettings } from "@/lib/actions/settings";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

export function AnalyticsDashboard({ lookerStudioUrl }: { lookerStudioUrl: string | null }) {
  const [state, formAction, pending] = useActionState(saveAnalyticsSettings, null);
  const [configOpen, setConfigOpen] = useState(!lookerStudioUrl);

  return (
    <div className="space-y-4">
      {/* Configuration card */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setConfigOpen((o) => !o)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <div>
            <span className="text-sm font-semibold text-gray-900">Looker Studio Embed URL</span>
            {lookerStudioUrl && !configOpen && (
              <p className="mt-0.5 text-xs text-gray-400 truncate max-w-lg">{lookerStudioUrl}</p>
            )}
          </div>
          {configOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
          )}
        </button>

        {configOpen && (
          <div className="border-t border-gray-100 px-6 pb-6 space-y-5">
            <form action={formAction} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label htmlFor="ls-url" className="block text-sm font-medium text-gray-700">
                  Embed URL
                </label>
                <input
                  id="ls-url"
                  type="url"
                  name="looker_studio_url"
                  defaultValue={lookerStudioUrl ?? ""}
                  placeholder="https://lookerstudio.google.com/embed/reporting/…"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-400">
                  In Looker Studio: File → Share → Embed report → copy the <strong>src</strong> URL from the iframe code.
                </p>
              </div>

              {state?.success && (
                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Saved. Reload the page to see the updated report.</span>
                </div>
              )}
              {state?.error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium
                           text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </form>

            {/* Setup guide */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-900">How to set up your dashboard</p>
              <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                <li>
                  Go to{" "}
                  <a href="https://lookerstudio.google.com" target="_blank" rel="noopener noreferrer"
                     className="underline inline-flex items-center gap-0.5">
                    lookerstudio.google.com <ExternalLink className="h-3 w-3" />
                  </a>{" "}
                  and create a new report.
                </li>
                <li>Add a data source → Google Analytics → select your GA4 property.</li>
                <li>
                  <strong>World Map:</strong> Insert → Geo Map → set <em>Geo dimension</em> to <em>City</em>, metric to <em>Sessions</em>. This shows a city-level bubble map.
                </li>
                <li>
                  <strong>Traffic by Hour:</strong> Insert → Bar chart → set <em>Dimension</em> to <em>Hour of Day</em>, metric to <em>Sessions</em>.
                </li>
                <li>
                  <strong>KPI Cards:</strong> Insert → Scorecard → repeat for <em>Total Users</em>, <em>Sessions</em>, <em>Pageviews</em>, <em>Bounce Rate</em>, and <em>Avg Session Duration</em>.
                </li>
                <li>
                  <strong>Traffic Sources:</strong> Insert → Pie chart → set <em>Dimension</em> to <em>Default Channel Group</em>.
                </li>
                <li>
                  <strong>Top Pages:</strong> Insert → Table → set <em>Dimension</em> to <em>Page path</em>, metrics to <em>Sessions</em> and <em>Pageviews</em>.
                </li>
                <li>
                  When done: File → Share → Embed report. Copy the <code className="bg-blue-100 px-1 rounded">src</code> value from the iframe snippet and paste it in the field above.
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Embedded report */}
      {lookerStudioUrl ? (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <iframe
            src={lookerStudioUrl}
            className="w-full"
            style={{ height: "calc(100vh - 260px)", minHeight: "700px", border: "none" }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-white p-16 text-center">
          <p className="text-sm text-gray-400">
            Configure your Looker Studio embed URL above to display the dashboard here.
          </p>
        </div>
      )}
    </div>
  );
}
