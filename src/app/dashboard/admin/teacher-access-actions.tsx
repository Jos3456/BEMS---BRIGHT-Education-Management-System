"use client";

import { useState } from "react";
import { revokeTeacherAccess } from "./actions";

export default function TeacherAccessActions({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [notes, setNotes] = useState("");

  return (
    <form
      action={revokeTeacherAccess}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Remove teaching access for ${name}? This removes only the teacher role. The account, other roles, and application history will remain.`,
        );
        if (!confirmed) event.preventDefault();
      }}
      className="mt-4 border-t border-[#e1eaf5] pt-4"
    >
      <input type="hidden" name="target_user_id" value={userId} />
      <label htmlFor={`revoke-notes-${userId}`} className="block text-sm font-semibold">
        Reason for removing access <span className="font-normal text-[#71849b]">(optional)</span>
      </label>
      <textarea
        id={`revoke-notes-${userId}`}
        name="notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        maxLength={2000}
        rows={2}
        placeholder="Record why teaching access is being removed."
        className="mt-2 w-full rounded-xl border border-[#dce7f3] px-3 py-2 text-sm outline-none focus:border-[#174a8b]"
      />
      <button
        type="submit"
        className="mt-3 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        Remove teacher access
      </button>
    </form>
  );
}
