"use client";
import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string, number, array, mixed } from "yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  FaStar,
  FaRegStar,
  FaSpinner,
  FaUpload,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

const hotelSchema = object({
  name: string().required("Hotel name is required").trim(),
  shortDescription: string()
    .required("Short description is required")
    .max(300, "Maximum 300 characters")
    .trim(),
  fullDescription: string().required("Full description is required").trim(),
  stars: number()
    .required("Star rating is required")
    .min(1, "Minimum 1 star")
    .max(5, "Maximum 5 stars"),
  price: number()
    .required("Price is required")
    .positive("Price must be a positive number")
    .typeError("Price must be a number"),
  thumbnail: mixed().test(
    "fileRequired",
    "Thumbnail image is required",
    (value) => value instanceof File && value.size > 0,
  ),
  address: object({
    street: string().trim(),
    city: string().trim(),
    state: string().trim(),
    country: string().trim(),
  }).default({}),
});

export default function AddHotelPage() {
  const router = useRouter();
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [rooms, setRooms] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(hotelSchema),
    defaultValues: {
      
      name: "",
      shortDescription: "",
      fullDescription: "",
      stars: 3,
      price: "",
      thumbnail: null,
      address: { street: "", city: "", state: "", country: "" },
    },
  });

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    if (file) {
      setValue("thumbnail", file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const addRoom = () => {
    const newRoom = {
      roomNumber: "",
      type: "single",
      price: 0,
      capacity: 2,
      amenities: "",
      isAvailable: true,
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  const removeRoom = (index) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRoom = (index, field, value) => {
    setRooms((prev) =>
      prev.map((room, i) => (i === index ? { ...room, [field]: value } : room)),
    );
  };

  const watchStars = watch("stars");

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/admin/hotels/add", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Hotel added successfully");
      reset();
      setRooms([]);
      setThumbnailPreview(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    const roomsData = rooms.map((r) => ({
      roomNumber: r.roomNumber,
      type: r.type,
      price: Number(r.price),
      capacity: Number(r.capacity),
      amenities: r.amenities ? r.amenities.split(",").map((a) => a.trim()) : [],
      isAvailable: r.isAvailable,
    }));
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("shortDescription", data.shortDescription);
    formData.append("fullDescription", data.fullDescription);
    formData.append("stars", data.stars);
    formData.append("price", data.price);
    formData.append("thumbnail", data.thumbnail);
    formData.append("rooms", JSON.stringify(roomsData));
    formData.append("address", JSON.stringify(data.address));
    mutation.mutate(formData);
  };

  return (
    <div className="h-full py-6 px-5 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold text-indigo-900 mb-8">
        Add <span className="text-purple-800">Hotel</span>
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Name *
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                placeholder="e.g. Grand Shiraz Hotel"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <input
                {...register("price")}
                type="number"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                placeholder="99"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description *
                <span className="text-gray-400 font-normal ml-1">
                  (max 300 chars)
                </span>
              </label>
              <textarea
                {...register("shortDescription")}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                placeholder="A brief summary of the hotel"
              ></textarea>
              {errors.shortDescription && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description *
              </label>
              <textarea
                {...register("fullDescription")}
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                placeholder="Detailed information about the hotel"
              ></textarea>
              {errors.fullDescription && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullDescription.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Media & Stars */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Media & Rating
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail Image *
              </label>
              <div className="flex items-center gap-4">
                <label className="relative cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-400 transition px-6 py-4 w-full">
                  <FaUpload className="text-gray-400 mr-2" />
                  <span className="text-gray-500 text-sm">Click to upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
                {thumbnailPreview && (
                  <div className="relative shrink-0">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-24 h-16 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue("thumbnail", null);
                        setThumbnailPreview(null);
                      }}
                      className="absolute -top-2 -right-2 cursor-pointer bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              {errors.thumbnail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.thumbnail.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Star Rating *
              </label>
              <Controller
                name="stars"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-2xl focus:outline-none"
                        onClick={() => field.onChange(star)}
                      >
                        {star <= (watchStars || 3) ? (
                          <FaStar className="text-amber-400 hover:scale-125 transition" />
                        ) : (
                          <FaRegStar className="text-gray-300 hover:text-amber-200 transition" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.stars && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.stars.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Street</label>
              <input
                {...register("address.street")}
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                placeholder="Street"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">City</label>
              <input
                {...register("address.city")}
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">State</label>
              <input
                {...register("address.state")}
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Country
              </label>
              <input
                {...register("address.country")}
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                placeholder="Country"
              />
            </div>
          </div>
        </section>

        {/* Rooms */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Rooms</h2>
            <button
              type="button"
              onClick={addRoom}
              className="flex items-center gap-1 cursor-pointer px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition text-sm"
            >
              <FaPlus /> Add Room
            </button>
          </div>
          {rooms.length === 0 && (
            <p className="text-gray-500 text-sm">
              No rooms added yet. You must add at least one room.
            </p>
          )}
          <div className="grid gap-4 mt-4">
            {rooms.map((room, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl p-4 relative bg-gray-50"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      value={room.roomNumber}
                      onChange={(e) =>
                        updateRoom(idx, "roomNumber", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                      placeholder="101"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Type *</label>
                    <select
                      value={room.type}
                      onChange={(e) => updateRoom(idx, "type", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="suite">Suite</option>
                      <option value="deluxe">Deluxe</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Price *</label>
                    <input
                      type="number"
                      value={room.price}
                      onChange={(e) => updateRoom(idx, "price", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Capacity</label>
                    <input
                      type="number"
                      value={room.capacity}
                      onChange={(e) =>
                        updateRoom(idx, "capacity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                      placeholder="2"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={room.isAvailable}
                        onChange={(e) =>
                          updateRoom(idx, "isAvailable", e.target.checked)
                        }
                        className="rounded"
                      />
                      <span className="text-xs text-gray-600">Available</span>
                    </label>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Amenities (comma separated)
                    </label>
                    <input
                      type="text"
                      value={room.amenities}
                      onChange={(e) =>
                        updateRoom(idx, "amenities", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                      placeholder="WiFi, TV"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRoom(idx)}
                  className="absolute top-2 cursor-pointer right-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-start gap-4 pb-4 ">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl cursor-pointer bg-gray-200 hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-3 rounded-xl cursor-pointer bg-amber-500 cursor- text-white hover:bg-amber-600 transition font-medium disabled:opacity-70 flex items-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <FaSpinner className="animate-spin" /> Saving...
              </>
            ) : (
              "Save Hotel"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
