"use client";

import { useState } from "react";
import { reviewTeacherApplication } from "./actions";

type ApplicationReviewActionsProps = {
  applicationId: string;
};

export default function ApplicationReviewActions({
  applicationId,
}: ApplicationReviewActionsProps) {
  const [notes, setNotes] = useState("");

  return (
    <form
      action={reviewTeacherApplication}
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;
        const decision = submitter?.value;

        if (decision !== "approved" && decision !== "rejected") {
          event.preventDefault();
          return;
        }

        const action = decision === "approved" ? "approve" : "reject";
        const confirmed = window.confirm(
          `Are you sure you want to ${action} this teacher application?${notes.trim() ? "\n\nYour review note will be saved with the decision." : ""}`,
        );

        if (!confirmed) event.preventDefault();
      }}
      className="mt-5 border-t border-[#e1eaf5] pt-4"
    >
      <input type="hidden" name="application_id" value={applicationId} />

      <label
        htmlFor={`review-notes-${applicationId}`}
        className="block text-sm font-semibold"
      >
        Review notes <span className="font-normal text-[#71849b]">(optional)</span>
      </label>
      <textarea
        id={`review-notes-${applicationId}`}
        name="notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Add feedback or a reason for your decision…"
        className="mt-2 w-full rounded-xl border border-[#dce7f3] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#174a8b] focus:ring-2 focus:ring-[#174a8b]/10"
      />

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="submit"
          name="decision"
          value="approved"
          className="rounded-xl bg-[#174a8b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#123d75] focus:outline-none focus:ring-2 focus:ring-[#174a8b]/30"
        >
          Approve application
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600/20"
        >
          Reject application
        </button>
      </div>
    </form>
  );
}
