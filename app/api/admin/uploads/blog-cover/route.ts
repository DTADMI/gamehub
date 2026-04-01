import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { hasRoleAtLeast } from "@/lib/admin/roles";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { getAdminUser } from "@/lib/supabase/admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const throttle = await rateLimit({
    key: `api:admin:uploads:blog-cover:${ip}`,
    windowMs: 60_000,
    limit: 20,
  });
  if (!throttle.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { user, isAdmin, role } = await getAdminUser();
  if (!user || !isAdmin || !role || !hasRoleAtLeast(role, "editor")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file payload" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large (max 5MB)" }, { status: 400 });
  }

  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/avif"
          ? "avif"
          : "jpg";
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const path = `blog-covers/${fileName}`;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ?? "media";

  const supabase = createServiceRoleClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed", details: uploadError.message },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({
    ok: true,
    path,
    url: data.publicUrl,
  });
}
