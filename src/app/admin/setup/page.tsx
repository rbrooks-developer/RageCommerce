import { checkSetupStatus } from "@/lib/actions/setup";
import { SetupClient } from "./SetupClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Site Setup" };

export default async function SetupPage() {
  const status = await checkSetupStatus();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Site Setup</h1>
        <p className="text-sm text-gray-500 mt-1">
          Check and install required features for this deployment. Use this page when setting up a new instance.
        </p>
      </div>
      <SetupClient status={status} />
    </div>
  );
}
