import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { UserRole } from "@/generated/prisma/client";
import {
  assertNoActiveCertificationWindows,
  buildCertificationImagePath,
  CERTIFICATION_IMAGE_ACCEPTED_TYPES,
  CERTIFICATION_IMAGE_MAX_BYTES,
  isAllowedCertificationImageType,
} from "@/lib/certification-admin";
import {
  AuthenticationRequiredError,
  InsufficientRoleError,
  requireRole,
} from "@/lib/user-profile";

export async function POST(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    await assertNoActiveCertificationWindows();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (error instanceof InsufficientRoleError) {
      return NextResponse.json({ error: "Only admins can upload images." }, { status: 403 });
    }

    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  if (!isAllowedCertificationImageType(file.type)) {
    return NextResponse.json(
      {
        error: `Only ${CERTIFICATION_IMAGE_ACCEPTED_TYPES.join(", ")} files are allowed.`,
      },
      { status: 400 }
    );
  }

  if (file.size > CERTIFICATION_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      {
        error: "Image must be 2MB or smaller.",
      },
      { status: 400 }
    );
  }

  try {
    const blob = await put(buildCertificationImagePath(file.name), file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload certification question image:", error);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
