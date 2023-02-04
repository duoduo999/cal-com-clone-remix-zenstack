import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { deleteBooking, getBooking } from "~/models/booking.server";
import { getUsers } from "~/models/user.server";

import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.bookingId, "bookingId not found");

  const booking = await getBooking({ userId, id: params.bookingId });
  if (!booking) {
    throw new Response("Not Found", { status: 404 });
  }

  const users = await getUsers();

  return json({ booking, users });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.bookingId, "bookingId not found");

  await deleteBooking({ userId, id: params.bookingId });

  return redirect("/booking");
}

export default function BookingDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  function onChangeInvite(inviteUserId: string, add: boolean) {
    fetcher.submit(
      {
        bookingId: data.booking.id,
        inviteUserId,
        add: add.toString(),
      },
      { method: "post", action: "/booking/updateInvite" }
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.booking.email}</h3>
      <div className="flex flex-col gap-4 py-6">
        <div>
          <p className="font-semibold">Owner</p>
          <p>{data.booking.user.email}</p>
        </div>
        <div>
          <p className="font-semibold">Start At</p>
          <p>{new Date(data.booking.startAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="font-semibold">Duration</p>
          <p>{data.booking.duration} minutes</p>
        </div>
        <div>
          <p className="font-semibold">Notes</p>
          <p>{data.booking.notes}</p>
        </div>
        <div>
          {}
          <p className="font-semibold">Invited Members</p>

          <div className="flex flex-col gap-1">
            {data.users
              .filter((user) => user.id !== data.booking.user.id)
              .map((user) => (
                <label key={user.id} className="flex items-center">
                  <span>{user.email}</span>
                  <input
                    type="checkbox"
                    className="ml-2"
                    checked={data.booking.invitedUsers.some(
                      (invite) => invite.userId === user.id
                    )}
                    onChange={(e) =>
                      onChangeInvite(user.id, e.currentTarget.checked)
                    }
                  />
                </label>
              ))}
          </div>
        </div>
      </div>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Booking not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
