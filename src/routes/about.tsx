import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { defaultProfile, getProfile, saveProfile, type Profile } from "@/lib/library-db";
import curatorAvatar from "@/assets/curator.jpg";
import { useOwner } from "@/hooks/use-owner";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the curator — Welcome to my library" },
      {
        name: "description",
        content: "Who keeps this shelf: an editable profile with name, bio and links for the library curator.",
      },
      { property: "og:title", content: "About the curator" },
      { property: "og:description", content: "The reader behind the personal archive." },
    ],
  }),
  component: About,
});

function About() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [editing, setEditing] = useState(false);
  const { owner } = useOwner();

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  const save = async () => {
    await saveProfile(profile);
    setEditing(false);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Shelf
      </Link>

      <div className="card-soft mt-10 px-6 py-10 text-center sm:px-12">
        <img
          src={curatorAvatar}
          alt="Portrait of the library curator"
          className="mx-auto h-28 w-28 rounded-full object-cover shadow-soft"
        />

        {editing ? (
          <div className="mt-8 space-y-4 text-left">
            <input
              value={profile.name}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              aria-label="Name"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
            />
            <textarea
              value={profile.bio}
              rows={4}
              onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
              aria-label="Bio"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
            />
            <input
              value={profile.links}
              onChange={(event) => setProfile({ ...profile, links: event.target.value })}
              aria-label="Links"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
            />
            <button
              type="button"
              onClick={save}
              className="rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground"
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <h1 className="mt-6 font-display text-4xl">{profile.name}</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">{profile.links}</p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-8 rounded-full border border-border px-6 py-3 text-xs uppercase tracking-[0.16em] transition-colors hover:bg-secondary"
            >
              Edit profile
            </button>
          </>
        )}
      </div>
    </main>
  );
}
