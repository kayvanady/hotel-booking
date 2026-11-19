"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaUpload,
  FaPlus,
  FaStar,
  FaRegStar,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { mixed, number, object, string } from "yup";

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
    (value) =>
      (value instanceof File && value.size > 0) ||
      (typeof value === "string" && value.length > 0),
  ),
  address: object({
    street: string().trim(),
    city: string().trim(),
    state: string().trim(),
    country: string().trim(),
  }).default({}),
});

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [editingHotel, setEditingHotel] = useState({
    id: "",
    name: "",
    shortDescription: "",
    fullDescription: "",
    stars: 3,
    price: "",
    thumbnail: null,
    address: { street: "", city: "", state: "", country: "" },
  });

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
      name: editingHotel.name,
      shortDescription: editingHotel.shortDescription,
      fullDescription: editingHotel.fullDescription,
      stars: editingHotel.stars,
      price: editingHotel.price,
      thumbnail: editingHotel.thumbnail,
      address: {
        street: editingHotel.address.street,
        city: editingHotel.address.city,
        state: editingHotel.address.state,
        country: editingHotel.address.country,
      },
    },
  });
  const handleHotelEdit = (hotel) => {
    setEditingHotel({
      id: hotel._id,
      name: hotel.name,
      shortDescription: hotel.shortDescription,
      fullDescription: hotel.fullDescription,
      stars: hotel.stars,
      price: hotel.price,
      thumbnail: hotel.thumbnail,
      address: {
        street: hotel.address.street,
        city: hotel.address.city,
        state: hotel.address.state,
        country: hotel.address.country,
      },
    });
    reset({
      name: hotel.name,
      shortDescription: hotel.shortDescription,
      fullDescription: hotel.fullDescription,
      stars: hotel.stars,
      price: hotel.price,
      thumbnail: hotel.thumbnail,
      address: {
        street: hotel.address.street,
        city: hotel.address.city,
        state: hotel.address.state,
        country: hotel.address.country,
      },
    });
    setIsHotelModalOpen(true);
    const roomsForState = (hotel.rooms || []).map((room) => ({
      ...room,
      amenities: Array.isArray(room.amenities)
        ? room.amenities.join(", ")
        : room.amenities || "",
    }));

    setRooms(roomsForState);
    if (hotel.thumbnail) {
      setThumbnailPreview(hotel.thumbnail);
    } else {
      setThumbnailPreview(null);
    }
  };

  const watchStars = watch("stars");

  const toggleRow = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const getUsers = async (search) => {
    try {
      const res = await fetch(`/api/admin/hotels?search=${search}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      } else {
        setHotels(data.hotels);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getUsers(search);
  }, [search]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
    setValue("thumbnail", file);
  };

  const addRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        roomNumber: "",
        type: "single",
        price: 0,
        capacity: 2,
        amenities: "",
        isAvailable: true,
      },
    ]);
  };

  const updateRoom = (index, field, value) => {
    setRooms((prev) =>
      prev.map((room, i) => (i === index ? { ...room, [field]: value } : room)),
    );
  };

  const removeRoom = (index) => {
    setRooms((prev) => prev.filter((_, i) => index !== i));
  };

  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch(`/api/admin/hotels/${editingHotel.id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return data;
    },
    onSuccess: (data) => {
      const updatedHotel = data.hotel;
      toast.success("Hotel Updated successFully");
      setHotels((prev) =>
        prev.map((h) =>
          updatedHotel._id === h._id ? { ...h, ...updatedHotel } : h,
        ),
      );
      setEditingHotel({
        id: "",
        name: "",
        shortDescription: "",
        fullDescription: "",
        stars: 3,
        price: "",
        thumbnail: null,
        address: { street: "", city: "", state: "", country: "" },
      });
      setRooms([]);
      setIsHotelModalOpen(false);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
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
    updateMutation.mutate(formData);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="w-14 h-14 border-2 border-amber-600 border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }
  return (
    <>
      <div className="h-screen py-6 px-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-center mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-900 px-2">
            Manage <span className="text-purple-800">Hotels</span>
          </h1>
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotels..."
            className="py-2.5 px-4 max-w-xs w-full border-2 border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition"
          />
        </div>

        
        <div className="overflow-x-auto rounded-2xl bg-linear-to-br from-white/70 via-purple-50/50 to-pink-50/50 backdrop-blur-md shadow-lg border border-white/40">
          <table className="w-full min-w-175 table-auto">
            <thead>
              <tr className="bg-linear-to-r from-indigo-100/80 to-purple-100/80 text-gray-700 uppercase text-xs tracking-wider">
                <th className="py-4 px-6 text-left font-semibold">#</th>
                <th className="py-4 px-6 text-left font-semibold">Name</th>
                <th className="py-4 px-6 text-left font-semibold">Image</th>
                <th className="py-4 px-6 text-left font-semibold">Address</th>
                <th className="py-4 px-6 text-left font-semibold">Created</th>
                <th className="py-4 px-6 text-center font-semibold">Actions</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {hotels.length > 0 ? (
                hotels.map((hotel, index) => (
                  <>
                    <tr
                      key={hotel._id}
                      className="hover:bg-white/50 transition-colors group"
                    >
                      <td className="py-4 px-6 text-gray-500 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 text-gray-800 font-semibold">
                        {hotel.name}
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative w-16 h-10 rounded-lg">
                          <Image
                            src={hotel.thumbnail}
                            alt={hotel.name}
                            width={64}
                            height={60}
                            className="object-cover rounded-lg"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {hotel.address?.state}, {hotel.address?.city}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(hotel.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 rounded-xl cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 transition-all hover:scale-110">
                            <FaTrash size={16} />
                          </button>
                          <button
                            onClick={() => handleHotelEdit(hotel, hotel.rooms)}
                            className="p-2 rounded-xl cursor-pointer text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all hover:scale-110"
                          >
                            <FaEdit size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleRow(index)}
                          className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-all hover:scale-110"
                        >
                          {expandedIndex === index ? (
                            <FaChevronUp className="text-gray-500" />
                          ) : (
                            <FaChevronDown className="text-gray-500" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* rooms */}
                    {expandedIndex === index && (
                      <tr
                        key={`${hotel._id}-rooms`}
                        className="bg-gray-50/80 backdrop-blur-sm"
                      >
                        <td colSpan={7} className="p-4">
                          <div className="rounded-xl bg-white/80 shadow-inner border border-gray-100 overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-gray-100/70 text-gray-600 text-xs uppercase tracking-wider">
                                <tr>
                                  <th className="py-4 px-6 text-left font-semibold">
                                    Room #
                                  </th>
                                  <th className="py-4 px-6 text-left font-semibold">
                                    Type
                                  </th>
                                  <th className="py-4 px-6 text-left font-semibold">
                                    Price
                                  </th>
                                  <th className="py-4 px-6 text-left font-semibold">
                                    Capacity
                                  </th>
                                  <th className="py-4 px-6 text-left font-semibold">
                                    Amenities
                                  </th>
                                  <th className="py-4 px-6 text-center font-semibold">
                                    Available
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {hotel.rooms?.length > 0 ? (
                                  hotel.rooms.map((room) => (
                                    <tr
                                      key={room.roomNumber}
                                      className="hover:bg-white/60 transition-colors"
                                    >
                                      <td className="py-4 px-6 text-gray-700 font-medium">
                                        {room.roomNumber}
                                      </td>
                                      <td className="py-4 px-6 text-gray-600 capitalize">
                                        {room.type}
                                      </td>
                                      <td className="py-4 px-6 text-gray-700 font-medium">
                                        ${room.price}
                                      </td>
                                      <td className="py-4 px-6 text-gray-600">
                                        {room.capacity}
                                      </td>
                                      <td className="py-4 px-6 text-gray-600">
                                        {room.amenities?.join(", ") || "—"}
                                      </td>
                                      <td className="py-4 px-6 text-center">
                                        {room.isAvailable ? (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Yes
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            No
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={7}
                                      className="py-6 text-center text-gray-400 italic"
                                    >
                                      No rooms added
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <p className="text-lg">No hotels found</p>
                    <p className="text-sm mt-1">
                      Add your first hotel to get started
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isHotelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsHotelModalOpen(false)}
          />

          <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40">
            <div className="py-6 px-5 sm:px-8">
              {/* Header */}
              <h1 className="text-3xl font-extrabold text-indigo-900 mb-8">
                Update <span className="text-purple-800">Hotel</span>
              </h1>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <section className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hotel Name */}
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

                    {/* Price */}
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

                    {/* Short Description */}
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

                    {/* Full Description */}
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
                    {/* Thumbnail Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail Image *
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="relative cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-amber-400 transition px-6 py-4 w-full">
                          <FaUpload className="text-gray-400 mr-2" />
                          <span className="text-gray-500 text-sm">
                            Click to upload
                          </span>
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

                    {/* Stars Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Star Rating *
                      </label>
                      {/* Star  */}
                      {control && (
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
                      )}
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
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Street
                      </label>
                      <input
                        {...register("address.street")}
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                        placeholder="Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        {...register("address.city")}
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        State
                      </label>
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
                    <h2 className="text-xl font-semibold text-gray-800">
                      Rooms
                    </h2>
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
                            <label className="text-xs text-gray-500">
                              Type *
                            </label>
                            <select
                              value={room.type}
                              onChange={(e) =>
                                updateRoom(idx, "type", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                            >
                              <option value="single">Single</option>
                              <option value="double">Double</option>
                              <option value="suite">Suite</option>
                              <option value="deluxe">Deluxe</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">
                              Price *
                            </label>
                            <input
                              type="number"
                              value={room.price}
                              onChange={(e) =>
                                updateRoom(idx, "price", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">
                              Capacity
                            </label>
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
                                  updateRoom(
                                    idx,
                                    "isAvailable",
                                    e.target.checked,
                                  )
                                }
                                className="rounded"
                              />
                              <span className="text-xs text-gray-600">
                                Available
                              </span>
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

                {/* Buttons */}
                <div className="flex justify-start gap-4 pb-4">
                  <button
                    type="button"
                    onClick={() => setIsHotelModalOpen(false)}
                    className="px-6 py-3 rounded-xl cursor-pointer bg-gray-200 hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-6 py-3 rounded-xl cursor-pointer bg-amber-500 text-white hover:bg-amber-600 transition font-medium disabled:opacity-70 flex items-center gap-2"
                  >
                    {updateMutation.isPending ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      "Update Hotel"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
