"use client";

import { useAuth } from "@/lib/auth-context";
import ChangePasswordForm from "@/app/dashboard/account/ChangePasswordForm";

// Shown instead of the dashboard while the user must change their password
// (a new account, an admin reset, or a default account still on its default
// password). The API refuses everything else until they do — see
// RequirePasswordChanged in api/internal/middleware/auth.go.
export default function ForcedPasswordChange() {
  const { user, refresh, logout } = useAuth();

  return (
    <div id="forced-password-change" className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <div className="auth-card w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <h1 className="mb-1 text-xl font-bold text-text dark:text-text-dark">Choose a New Password</h1>
        <p className="mb-6 text-sm text-text-muted dark:text-text-muted-dark">
          {user?.fullName ? `${user.fullName}, your` : "Your"} password must be changed before you can continue. Enter the
          password you just signed in with, then a new one.
        </p>
        <ChangePasswordForm forced onChanged={refresh} />
        <button
          id="forced-password-change-sign-out"
          type="button"
          onClick={logout}
          className="mt-6 cursor-pointer text-sm text-text-muted underline underline-offset-2 dark:text-text-muted-dark"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
