import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const AssignListSchema = z.object({
  setId: z.string().min(1),
  childIds: z.array(z.string()),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = AssignListSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { setId, childIds } = parsed.data;

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from(TABLES.USERS)
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== USER_ROLES.PARENT) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serviceClient = createServiceClient();

    // Verify set ownership
    const { data: spellingSet } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .eq("id", setId)
      .eq("created_by", user.id)
      .eq("type", "personal")
      .single();

    if (!spellingSet) {
      return NextResponse.json(
        { error: "List not found or not owned by you" },
        { status: 404 }
      );
    }

    // Verify all childIds are owned by this parent
    if (childIds.length > 0) {
      const { data: ownedChildren } = await serviceClient
        .from(TABLES.PARENT_CHILDREN)
        .select("child_id")
        .eq("parent_id", user.id)
        .in("child_id", childIds);

      const ownedIds = new Set(ownedChildren?.map((c) => c.child_id) ?? []);
      const unowned = childIds.filter((id) => !ownedIds.has(id));

      if (unowned.length > 0) {
        return NextResponse.json(
          { error: "One or more children are not owned by you" },
          { status: 403 }
        );
      }
    }

    // Delete all existing assignments for this set
    const { error: deleteError } = await serviceClient
      .from(TABLES.CHILD_PERSONAL_SETS)
      .delete()
      .eq("set_id", setId);

    if (deleteError) {
      console.error("assign-list delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to update assignments" },
        { status: 500 }
      );
    }

    // Insert new assignments if any
    if (childIds.length > 0) {
      const { error: insertError } = await serviceClient
        .from(TABLES.CHILD_PERSONAL_SETS)
        .insert(
          childIds.map((child_id) => ({ set_id: setId, child_id }))
        );

      if (insertError) {
        console.error("assign-list insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to assign list" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("assign-list unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
