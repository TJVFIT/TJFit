"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";

type Application = {
  id: string;
  created_at: string;
  age: number;
  full_name: string;
  specialty: string;
  languages: string;
  country: string;
  certifications_and_style: string;
  locale: string | null;
};

export function AdminCoachApplications({
  dict,
  initialApplications = []
}: {
  dict: Dictionary["admin"];
  initialApplications?: Application[];
}) {
  const [applications] = useState<Application[]>(initialApplications);

  return (
    <div className="glass-panel rounded-[32px] p-6">
      <p className="text-lg font-semibold text-white">{dict.coachApplications}</p>
      <p className="mt-2 text-sm text-zinc-400">
        {applications.length} {dict.coachApplicationsCount}{applications.length !== 1 ? "s" : ""} received
      </p>
      <div className="mt-6 max-h-96 space-y-4 overflow-y-auto">
        {applications.length === 0 ? (
          <p className="text-sm text-zinc-500">{dict.noApplications}</p>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="rounded-[24px] border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white">{app.full_name}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                <p><span className="text-zinc-500">Age:</span> {app.age}</p>
                <p><span className="text-zinc-500">Specialty:</span> {app.specialty}</p>
                <p><span className="text-zinc-500">Languages:</span> {app.languages}</p>
                <p><span className="text-zinc-500">Country:</span> {app.country}</p>
              </div>
              <p className="mt-3 text-sm text-zinc-400 line-clamp-2">
                {app.certifications_and_style}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
