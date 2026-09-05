"use client";

import { useState } from "react";
import type { User } from "@/lib/cloud-sync";
import type { LearnerProgress, LearnerSettings } from "@/lib/progress";
import { CloudIcon, LockIcon, ProfileIcon } from "@/components/app-icons";

interface ProfileViewProps {
  progress: LearnerProgress;
  user: User | null;
  cloudConfigured: boolean;
  syncStatus: "local" | "syncing" | "synced" | "error";
  onSettingsChange: (settings: Partial<LearnerSettings>) => void;
  onGoogleSignIn: () => Promise<void>;
  onMagicLink: (email: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function ProfileView({ progress, user, cloudConfigured, syncStatus, onSettingsChange, onGoogleSignIn, onMagicLink, onSignOut }: ProfileViewProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function sendMagicLink() {
    if (!email.trim()) return;
    try {
      await onMagicLink(email.trim());
      setMessage("Check your email for a secure sign-in link.");
    } catch {
      setMessage("The sign-in link could not be sent. Check the address and try again.");
    }
  }

  return (
    <section className="view-page profile-view">
      <header className="view-header simple"><div><span className="overline accent">Profile</span><h1>Make ByteScroll yours.</h1><p>Your learning works without an account. Sign in when you want it on every device.</p></div></header>

      <div className="profile-grid">
        <section className="surface-panel account-panel">
          <div className="section-heading"><div><span className="overline">Account</span><h2>{user ? "Progress sync is on" : "Continue across devices"}</h2></div><span className={`sync-badge ${syncStatus}`}><CloudIcon />{syncStatus === "synced" ? "Synced" : syncStatus === "syncing" ? "Syncing" : syncStatus === "error" ? "Sync issue" : "This device"}</span></div>

          {user ? (
            <div className="signed-in-card">
              <span className="account-avatar"><ProfileIcon /></span>
              <div><strong>{user.user_metadata?.full_name ?? user.email ?? "ByteScroll learner"}</strong><small>{user.email}</small></div>
              <button className="text-button" onClick={onSignOut}>Sign out</button>
            </div>
          ) : cloudConfigured ? (
            <div className="auth-options">
              <button className="google-button" onClick={onGoogleSignIn}><span>G</span> Continue with Google</button>
              <div className="auth-divider"><span>or use a magic link</span></div>
              <div className="email-row"><input type="email" value={email} placeholder="you@example.com" aria-label="Email address" onChange={(event) => setEmail(event.target.value)} /><button onClick={sendMagicLink}>Send link</button></div>
              {message && <p className="form-message">{message}</p>}
            </div>
          ) : (
            <div className="sync-placeholder">
              <span><LockIcon /></span>
              <div><strong>Guest mode is active</strong><p>Your progress is safely stored on this device. Connect the included Supabase setup when you&apos;re ready to enable secure Google and email sign-in.</p></div>
            </div>
          )}
        </section>

        <section className="surface-panel preferences-panel">
          <span className="overline">Learning preferences</span>
          <h2>Your daily rhythm</h2>
          <label><span>Starting checkpoint</span><select value={progress.settings.dailyGoal} onChange={(event) => onSettingsChange({ dailyGoal: Number(event.target.value) as 5 | 10 | 20 })}><option value="5">5 cards</option><option value="10">10 cards</option><option value="20">20 cards</option></select></label>
          <label><span>Starting level</span><select value={progress.settings.experience} onChange={(event) => onSettingsChange({ experience: event.target.value as LearnerSettings["experience"] })}><option value="new">From scratch</option><option value="some">I know a little</option></select></label>
        </section>

        <section className="surface-panel install-panel">
          <span className="overline">Phone access</span>
          <h2>Keep it one tap away</h2>
          <p>Open ByteScroll in your phone browser, then choose <strong>Add to Home Screen</strong>. It launches like an app and keeps your next lesson close.</p>
          <div className="install-preview"><span className="brand-mark">B</span><div><strong>ByteScroll</strong><small>Installable web app</small></div></div>
        </section>
      </div>
    </section>
  );
}
