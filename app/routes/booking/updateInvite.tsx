import { type ActionArgs, json } from "@remix-run/node";
import { updateInvite } from "~/models/booking.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const bookingId = formData.get("bookingId") as string;
  const inviteUserId = formData.get("inviteUserId") as string;
  const add = formData.get("add") === "true";

  try {
    await updateInvite({
      userId,
      bookingId,
      inviteUserId,
      add,
    });
    return json({ error: null, ok: true });
  } catch (error: any) {
    return json({ error: error.message, ok: false });
  }
}
