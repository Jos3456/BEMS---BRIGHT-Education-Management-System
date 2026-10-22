"use client";

import { useState } from "react";

export default function RejectionNotice({ notes }: { notes: string | null }) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="rejection-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 text-[#17324f] shadow-2xl sm:p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-700" aria-hidden="true">
          !
        </div>
        <h2 id="rejection-title" className="mt-4 text-2xl font-bold">
          Your teacher application was not approved
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#526b86]">
          You do not currently have teacher access. Please read the administrator&apos;s feedback below. An administrator can reopen your application if you are invited to revise and resubmit it.
        </p>
        {notes ? (
          <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-900">Administrator feedback</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-900">{notes}</p>
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-[#f7faff] p-4 text-sm leading-6 text-[#526b86]">
            No written feedback was provided. Contact BEMS support if you need clarification.
          </p>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 w-full rounded-xl bg-[#174a8b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123d75]"
        >
          I understand
        </button>
      </section>
    </div>
  );
}
