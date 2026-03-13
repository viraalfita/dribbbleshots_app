import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { adminReviews, notifications, shotPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const planId = parseInt(resolvedParams.id, 10);
  if (isNaN(planId))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const { decision, fieldNotesJson } = await request.json();

    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const plan = await db.query.shotPlans.findFirst({
      where: eq(shotPlans.id, planId),
    });

    if (!plan)
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    // 1. Save Admin Review
    const [review] = await db
      .insert(adminReviews)
      .values({
        planId,
        reviewerId: session.userId!,
        decision,
        fieldNotesJson: fieldNotesJson ?? {},
      })
      .returning({ id: adminReviews.id });

    // 2. Update Plan Status
    await db
      .update(shotPlans)
      .set({ status: decision })
      .where(eq(shotPlans.id, planId));

    // 3. Create Notification for Designer
    await db.insert(notifications).values({
      userId: plan.designerId,
      planId: plan.id,
      message: `Your Dribbble Shot Plan "${plan.title}" has been ${decision}.`,
      type: decision,
    });

    return NextResponse.json({ success: true, reviewId: review.id });
  } catch (error) {
    console.error("Error reviewing plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
