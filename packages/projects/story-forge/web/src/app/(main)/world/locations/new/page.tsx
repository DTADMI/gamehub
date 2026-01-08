import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import { Card } from "@games/shared";

async function createLocation(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name) return;

  await apiFetch("/world/locations", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
  redirect("/world");
}

export default async function NewLocationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-extrabold">Create New Location</h1>
      <Card className="p-6">
        <form action={createLocation} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              name="name"
              required
              className="border-fg/20 bg-bg mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
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
              Create Location
            </button>
          </div>
        </form>
      </Card>
    </main>
  );
}
