import connectDb from "@/configs/db";
import Hotel from "@/models/Hotel";
import Link from "next/link";

export default async function HotelPage({ params }) {
  const { city } = await params;

  await connectDb();

  const cityName = decodeURIComponent(city).trim();

  const hotels = await Hotel.find({
    "address.city": {
      $regex: `^${cityName}$`,
      $options: "i",
    },
  }).lean();

  return (
    <>
      <main className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
              LuxeStay
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Hotels in {cityName}
            </h1>

            <p className="mt-2 text-slate-500">
              Discover comfortable places to stay in {cityName}.
            </p>

            <div className="mt-5 h-px w-full bg-slate-200" />
          </div>

          {hotels.length > 0 ? (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {hotels.map((hotel) => (
                <article
                  key={hotel._id.toString()}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={hotel.thumbnail}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 shadow-md backdrop-blur-sm">
                      ⭐ {hotel.rating || "4.5"}
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {hotel.name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      📍 {hotel.address?.city}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                      {hotel.description ||
                        "Enjoy a comfortable stay with modern facilities and excellent service."}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <span className="text-2xl font-bold text-slate-900">
                          ${hotel.price || 120}
                        </span>

                        <span className="ml-1 text-sm text-slate-400">
                          / night
                        </span>
                      </div>

                      <Link
                        href={`/hotel/${hotel._id}`}
                        className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                      >
                        View Hotel
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <h2 className="text-xl font-semibold text-slate-800">
                No hotels found
              </h2>

              <p className="mt-2 text-slate-500">
                We couldn't find any hotels in {city}.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
