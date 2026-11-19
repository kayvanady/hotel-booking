import connectDb from "@/configs/db";
import Hotel from "@/models/Hotel";
import Link from "next/link";

export default async function HotelPage({ params }) {
  const { hotelId } = await params;

  await connectDb();

  const hotel = await Hotel.findById(hotelId).lean();

  if (!hotel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Hotel not found</h1>

          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const availableRooms = hotel.rooms.filter((room) => room.isAvailable);

  
  

  return (
    <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="h-87.5 lg:h-112.5">
              <img
                src={hotel.thumbnail}
                alt={hotel.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-amber-500">
                  {"★".repeat(hotel.stars)}
                </span>

                <span className="text-sm text-slate-500">
                  {hotel.stars} Star Hotel
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {hotel.name}
              </h1>

              <p className="mt-4 leading-7 text-slate-600">
                {hotel.fullDescription}
              </p>

              <div className="mt-6 space-y-2 text-sm text-slate-500">
                <p>
                  📍 {hotel.address?.street}, {hotel.address?.city}
                </p>

                <p>
                  🌍 {hotel.address?.state}, {hotel.address?.country}
                </p>
              </div>

              <div className="mt-7">
                <span className="text-sm text-slate-500">
                  Rooms starting from
                </span>

                <div className="mt-1">
                  <span className="text-3xl font-bold text-slate-900">
                    ${hotel.price}
                  </span>

                  <span className="ml-1 text-sm text-slate-500">/ night</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-7">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
              Accommodation
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              Available Rooms
            </h2>

            <p className="mt-2 text-slate-500">
              Choose the room that fits your stay.
            </p>
          </div>

          {availableRooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <h3 className="text-xl font-semibold text-slate-800">
                No rooms available
              </h3>

              <p className="mt-2 text-slate-500">
                Unfortunately, this hotel currently has no available rooms.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {availableRooms.map((room , index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-amber-600">
                        {room.type}
                      </p>

                      <h3 className="mt-1 text-2xl font-bold capitalize text-slate-900">
                        {room.type} Room
                      </h3>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      Available
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <p>🚪 Room {room.roomNumber}</p>
                    <p>👤 Up to {room.capacity} guests</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {room.amenities?.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">
                        ${room.price}
                      </span>

                      <span className="ml-1 text-sm text-slate-400">
                        / night
                      </span>
                    </div>

                    <Link
                      href={`/hotel/${hotel._id}/${room._id}`}
                      className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                      View Room
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
