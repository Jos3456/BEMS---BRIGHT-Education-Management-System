
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "learning-resources";
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const categories = [
  { value: "notes", label: "Class notes" },
  { value: "revision_papers", label: "Revision papers" },
  { value: "past_papers", label: "Past papers" },
  { value: "textbooks", label: "Textbooks" },
  { value: "videos", label: "Educational videos" },
  { value: "worksheets", label: "Worksheets" },
  { value: "presentations", label: "Presentations" },
  { value: "other", label: "Other resources" },
];

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
];

type Resource = {
  id: string;
  title: string;
  category: string;
  description: string;
  curriculum: string;
  subject: string;
  education_level: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: "draft" | "published";
  created_at: string;
};

const fieldClass =
  "mt-1 w-full rounded-xl border border-[#dce7f3] bg-white px-3 py-3 text-sm outline-none focus:border-[#2876bb] focus:ring-2 focus:ring-[#2876bb]/10";

export default function ResourcesManager() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("notes");
  const [description, setDescription] = useState("");
  const [curriculum, setCurriculum] = useState("General");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadResources = useCallback(async () => {
    const supabase = createClient();
    const { data, error: loadError } = await supabase
      .from("learning_resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Could not load resources. Check your database migration and permissions.");
      return;
    }

    setResources((data ?? []) as Resource[]);
  }, []);

useEffect(() => {
  const timer = setTimeout(() => {
    void loadResources();
  }, 0);

  return () => clearTimeout(timer);
}, [loadResources]);

  async function uploadResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      setError("The file must be smaller than or equal to 50 MB.");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError("That file type is not supported. Choose a PDF, document, image, text file, or MP4 video.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    let uploadedPath: string | null = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const safeName = file.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(-180);

      uploadedPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(uploadedPath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setError(`File upload failed: ${uploadError.message}`);
        return;
      }

      const { error: insertError } = await supabase
        .from("learning_resources")
        .insert({
          title: title.trim(),
          category,
          description: description.trim(),
          curriculum: curriculum.trim() || "General",
          subject: subject.trim(),
          education_level: level.trim(),
          file_path: uploadedPath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status,
          created_by: user.id,
        });

      if (insertError) {
        // Avoid leaving an orphaned file if saving its record fails.
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
        uploadedPath = null;
        setError(`Resource details could not be saved: ${insertError.message}`);
        return;
      }

      setTitle("");
      setCategory("notes");
      setDescription("");
      setCurriculum("General");
      setSubject("");
      setLevel("");
      setStatus("draft");
      setFile(null);

      const input = document.getElementById(
        "resource-file",
      ) as HTMLInputElement | null;
      if (input) input.value = "";

      setMessage("Resource uploaded successfully.");
      await loadResources();
    } catch {
      setError("Something went wrong while uploading. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(resource: Resource) {
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const supabase = createClient();
      const nextStatus =
        resource.status === "published" ? "draft" : "published";

      const { error: updateError } = await supabase
        .from("learning_resources")
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resource.id);

      if (updateError) {
        setError(`Status could not be changed: ${updateError.message}`);
        return;
      }

      setMessage(
        nextStatus === "published"
          ? "Resource published."
          : "Resource returned to drafts.",
      );

      await loadResources();
    } finally {
      setBusy(false);
    }
  }

  async function deleteResource(resource: Resource) {
    if (
      !window.confirm(
        `Delete "${resource.title}" and its uploaded file? This cannot be undone.`,
      )
    ) {
      return;
    }

    setError("");
    setMessage("");
    setBusy(true);

    try {
      const supabase = createClient();

      // Remove the database record first, so a failed database operation
      // never leaves a record pointing to a deleted file.
      const { error: deleteRecordError } = await supabase
        .from("learning_resources")
        .delete()
        .eq("id", resource.id);

      if (deleteRecordError) {
        setError(`Resource could not be deleted: ${deleteRecordError.message}`);
        return;
      }

      const { error: deleteFileError } = await supabase.storage
        .from(BUCKET)
        .remove([resource.file_path]);

      if (deleteFileError) {
        setError(
          "The resource record was deleted, but its stored file could not be removed. An administrator should clean up the unused file.",
        );
      } else {
        setMessage("Resource deleted.");
      }

      await loadResources();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#e1eaf5] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">Learning resources</h2>
        <p className="mt-1 text-sm text-[#71849b]">
          Upload official learning materials and control when they become available.
          Maximum file size: 50 MB.
        </p>
      </div>

      {message && (
        <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <form onSubmit={uploadResource} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Resource title *
          <input
            className={fieldClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={180}
            required
            minLength={2}
            placeholder="e.g. Form 2 Biology Notes"
          />
        </label>

        <label className="text-sm font-semibold">
          Category *
          <select
            className={fieldClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold">
          Curriculum
          <input
            className={fieldClass}
            value={curriculum}
            onChange={(e) => setCurriculum(e.target.value)}
            maxLength={100}
            placeholder="e.g. Kenyan CBC, Cambridge, IB"
          />
        </label>

        <label className="text-sm font-semibold">
          Subject
          <input
            className={fieldClass}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={120}
            placeholder="e.g. Mathematics"
          />
        </label>

        <label className="text-sm font-semibold sm:col-span-2">
          Grade / education level
          <input
            className={fieldClass}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            maxLength={120}
            placeholder="e.g. Grade 8, Form 2, Undergraduate"
          />
        </label>

        <label className="text-sm font-semibold sm:col-span-2">
          Description
          <textarea
            className={fieldClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={3000}
            rows={4}
            placeholder="Describe what learners will find in this resource."
          />
        </label>

        <label className="text-sm font-semibold sm:col-span-2">
          File *
          <input
            id="resource-file"
            className={fieldClass}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp,.mp4"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
          <span className="mt-1 block text-xs font-normal text-[#71849b]">
            PDF, Office documents, text, images or MP4 video.
          </span>
        </label>

        <label className="text-sm font-semibold">
          Visibility
          <select
            className={fieldClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          >
            <option value="draft">Save as draft</option>
            <option value="published">Publish immediately</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[#174a8b] px-5 py-3 font-semibold text-white transition hover:bg-[#10396d] disabled:opacity-60"
          >
            {busy ? "Please wait..." : "Upload resource"}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-[#e1eaf5] pt-6">
        <h3 className="text-lg font-bold">Uploaded resources</h3>

        {resources.length === 0 ? (
          <p className="mt-3 rounded-xl bg-[#f7faff] p-4 text-sm text-[#71849b]">
            No resources have been uploaded yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {resources.map((resource) => (
              <article
                key={resource.id}
                className="rounded-xl border border-[#e1eaf5] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold">{resource.title}</h4>
                    <p className="mt-1 text-sm text-[#71849b]">
                      {categories.find((c) => c.value === resource.category)?.label
                        ?? resource.category}
                      {" · "}
                      {resource.curriculum}
                      {resource.subject ? ` · ${resource.subject}` : ""}
                    </p>
                    {resource.description && (
                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        {resource.description}
                      </p>
                    )}
                    <p className="mt-2 break-all text-xs text-[#71849b]">
                      {resource.file_name} ·{" "}
                      {(resource.file_size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      resource.status === "published"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {resource.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void changeStatus(resource)}
                    className="rounded-lg border border-[#dce7f3] px-3 py-2 text-sm font-semibold hover:bg-[#f7faff] disabled:opacity-60"
                  >
                    {resource.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void deleteResource(resource)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
