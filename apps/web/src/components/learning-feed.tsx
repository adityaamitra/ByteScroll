"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cloudSyncConfigured,
  getCloudClient,
  loadCloudProgress,
  saveCloudProgress,
  type User,
} from "@/lib/cloud-sync";
import { tracks, type TrackId } from "@/lib/curriculum";
import {
  createEmptyProgress,
  finishOnboarding,
  loadProgress,
  saveProgress,
  setActiveTab,
  setActiveTrack,
  updateSettings,
  type AppTab,
  type LearnerProgress,
  type LearnerSettings,
} from "@/lib/progress";
import { LearnIcon, ProfileIcon, ProgressIcon, TracksIcon } from "@/components/app-icons";
import { LessonView } from "@/components/lesson-view";
import { Onboarding } from "@/components/onboarding";
import { ProfileView } from "@/components/profile-view";
import { ProgressView } from "@/components/progress-view";
import { PwaRegister } from "@/components/pwa-register";
import { TracksView } from "@/components/tracks-view";

const navigation: Array<{ id: AppTab; label: string; icon: typeof LearnIcon }> = [
  { id: "learn", label: "Learn", icon: LearnIcon },
  { id: "progress", label: "Progress", icon: ProgressIcon },
  { id: "tracks", label: "Tracks", icon: TracksIcon },
  { id: "profile", label: "Profile", icon: ProfileIcon },
];

export function LearningFeed() {
  const [progress, setProgress] = useState<LearnerProgress>(createEmptyProgress);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"local" | "syncing" | "synced" | "error">("local");
  const cloudConfigured = cloudSyncConfigured();

  useEffect(() => {
    setProgress(loadProgress());
    setReady(true);
  }, []);

  useEffect(() => {
    const client = getCloudClient();
    if (!client) return;

    client.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setCloudReady(false);
        setSyncStatus("local");
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !ready) return;
    let active = true;

    async function hydrateCloud() {
      setSyncStatus("syncing");
      try {
        const remote = await loadCloudProgress(user as User);
        if (!active) return;
        if (remote) {
          setProgress(remote);
          saveProgress(remote);
        } else {
          await saveCloudProgress(user as User, progress);
        }
        setCloudReady(true);
        setSyncStatus("synced");
      } catch {
        if (active) setSyncStatus("error");
      }
    }

    hydrateCloud();
    return () => { active = false; };
    // A newly authenticated user should hydrate once; progress changes sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, ready]);

  useEffect(() => {
    if (!user || !cloudReady) return;
    setSyncStatus("syncing");
    const timeout = window.setTimeout(() => {
      saveCloudProgress(user, progress)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [progress, user, cloudReady]);

  const initials = useMemo(() => {
    const name = user?.user_metadata?.full_name as string | undefined;
    if (name) return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    return user?.email?.slice(0, 2).toUpperCase() ?? "BS";
  }, [user]);

  function persist(next: LearnerProgress) {
    setProgress(next);
    saveProgress(next);
  }

  function changeTab(tab: AppTab) {
    persist(setActiveTab(progress, tab));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeTrack(trackId: TrackId) {
    persist(setActiveTrack(progress, trackId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function signInWithGoogle() {
    const client = getCloudClient();
    if (!client) return;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async function sendMagicLink(email: string) {
    const client = getCloudClient();
    if (!client) return;
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  async function signOut() {
    const client = getCloudClient();
    if (!client) return;
    await client.auth.signOut();
  }

  function changeSettings(settings: Partial<LearnerSettings>) {
    persist(updateSettings(progress, settings));
  }

  if (!ready) return <main className="loading-screen"><span className="brand-mark">B</span><p>Preparing your next scroll…</p></main>;

  if (!progress.settings.onboardingComplete) {
    return <Onboarding onComplete={(settings) => persist(finishOnboarding(progress, settings))} />;
  }

  return (
    <main className="app-shell">
      <PwaRegister />
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => changeTab("learn")} aria-label="Open ByteScroll learning feed"><span className="brand-mark">B</span><span>ByteScroll</span></button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => { const Icon = item.icon; return <button className={progress.activeTab === item.id ? "active" : ""} onClick={() => changeTab(item.id)} key={item.id}><Icon />{item.label}</button>; })}
        </nav>
        <div className="topbar-account"><span className="header-streak">{progress.streak} day streak</span><button className="avatar" onClick={() => changeTab("profile")} aria-label="Open profile">{initials}</button></div>
      </header>

      <div className="app-content">
        {progress.activeTab === "learn" && <LessonView progress={progress} onProgressChange={persist} onTrackChange={changeTrack} />}
        {progress.activeTab === "progress" && <ProgressView progress={progress} />}
        {progress.activeTab === "tracks" && <TracksView progress={progress} onSelect={changeTrack} />}
        {progress.activeTab === "profile" && (
          <ProfileView
            progress={progress}
            user={user}
            cloudConfigured={cloudConfigured}
            syncStatus={syncStatus}
            onSettingsChange={changeSettings}
            onGoogleSignIn={signInWithGoogle}
            onMagicLink={sendMagicLink}
            onSignOut={signOut}
          />
        )}
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.map((item) => { const Icon = item.icon; return <button className={progress.activeTab === item.id ? "active" : ""} onClick={() => changeTab(item.id)} key={item.id}><Icon /><span>{item.label}</span></button>; })}
      </nav>
    </main>
  );
}
