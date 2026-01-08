import { Card } from "@games/shared";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { apiFetch } from "@/lib/api";
import { authOptions } from "@/lib/auth";

async function createCharacter(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const traits = String(formData.get("traits") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  if (!name) {return;}

  await apiFetch("/world/characters", {
    method: "POST",
    body: JSON.stringify({ name, traits, bio }),
  });
  redirect("/world");
}

export default async function NewCharacterPage() {
  const session = await getServerSession(authOptions);
  if (!session) {redirect("/signin");}

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">Create New Character</h1>
      <Card className="p-6">
        <form action={createCharacter} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              required
              className="border-fg/20 bg-bg mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Traits / Keywords</label>
            <input
              name="traits"
              placeholder="e.g. Brave, Impatient, Noble"
              className="border-fg/20 bg-bg mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bio / Backstory</label>
            <textarea
              name="bio"
              rows={5}
              className="border-fg/20 bg-bg mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <a
              href="/world"
              className="border-fg/20 hover:bg-fg/5 rounded-md border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </a>
            <button className="bg-brand rounded-md px-4 py-2 text-sm font-medium text-white">
              Create Character
            </button>
          </div>
        </form>
      </Card>
    </main>
  );
}
