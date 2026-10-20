
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserStatus } from "./user-management-actions";

type AdminUser = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  account_status: string;
  roles: string[];
  created_at: string;
};

export default function UserManagement({
  users,
  loadError,
}: {
  users: AdminUser[];
  loadError: boolean;
}) {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [pendingUser, setPendingUser] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase();

    return [
      user.full_name ?? "",
      user.email ?? "",
      user.account_status,
      ...(user.roles ?? []),
    ].some((value) => value.toLowerCase().includes(term));
  });

  function changeStatus(user: AdminUser) {
    const nextStatus =
      user.account_status === "suspended" ? "active" : "suspended";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus === "suspended" ? "suspend" : "reactivate"
      } ${user.full_name || user.email || "this user"}?`,
    );

    if (!confirmed) return;

    setMessage("");
    setPendingUser(user.user_id);

    startTransition(async () => {
      const result = await setUserStatus(user.user_id, nextStatus);

      setMessage(result.message);
      setPendingUser("");

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#e1eaf5] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">User management</h2>
      <p className="mt-1 text-sm text-[#71849b]">
        Search accounts, review roles and manage account status.
      </p>

      {message && (
        <p role="status" className="mt-4 rounded-xl bg-[#f0f6ff] p-3 text-sm">
          {message}
        </p>
      )}

      {loadError ? (
        <p role="alert" className="mt-5 text-sm text-red-700">
          Users could not be loaded. Check the database function and permissions.
        </p>
      ) : (
        <>
          <label htmlFor="user-search" className="mt-5 block text-sm font-medium">
            Search users
          </label>
          <input
            id="user-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email, role or status..."
            className="mt-2 w-full rounded-xl border border-[#dce7f3] px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <p className="mt-3 text-sm text-[#71849b]">
            Showing {filteredUsers.length} of {users.length} users
          </p>

          {filteredUsers.length === 0 ? (
            <p className="mt-4 rounded-xl bg-[#f7faff] p-4 text-sm">
              No matching users found.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredUsers.map((user) => {
                const isAdmin = user.roles?.includes("admin");
                const isSuspended = user.account_status === "suspended";

                return (
                  <article
                    key={user.user_id}
                    className="rounded-xl border border-[#e1eaf5] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold">
                          {user.full_name || "Unnamed user"}
                        </h3>
                        <p className="mt-1 break-all text-sm text-[#71849b]">
                          {user.email || "No email available"}
                        </p>
                        <p className="mt-2 text-sm">
                          Roles: {user.roles?.length
                            ? user.roles.join(", ")
                            : "No assigned roles"}
                        </p>
                        <p className="mt-1 text-xs text-[#71849b]">
                          Joined: {new Date(user.created_at).toISOString().slice(0, 10)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isSuspended
                            ? "bg-red-50 text-red-700"
                            : user.account_status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.account_status}
                      </span>
                    </div>

                    <div className="mt-4">
                      {isAdmin ? (
                        <p className="text-xs text-[#71849b]">
                          Administrator accounts cannot be changed here.
                        </p>
                      ) : (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => changeStatus(user)}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                            isSuspended
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          {isPending && pendingUser === user.user_id
                            ? "Updating..."
                            : isSuspended
                              ? "Reactivate account"
                              : "Suspend account"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
