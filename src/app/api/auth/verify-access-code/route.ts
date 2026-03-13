import { NextResponse } from "next/server";
import { z } from "zod";

const EARLY_ACCESS_CODE = process.env.EARLY_ACCESS_CODE ?? "Spellingisfun!";

const Schema = z.object({
  code: z.string().min(1, "Access code is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: "Access code is required" },
        { status: 400 }
      );
    }

    const valid = parsed.data.code === EARLY_ACCESS_CODE;

    if (!valid) {
      return NextResponse.json(
        { valid: false, error: "Invalid early access code" },
        { status: 403 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
