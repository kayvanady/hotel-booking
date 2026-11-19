"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MdDelete, MdEdit } from "react-icons/md";
import { object, string } from "yup";
import { FaSpinner } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });

  const editSchema = object({
    name: string()
      .required("This field is required")
      .min(3, "At least 3 characters needed")
      .trim(),
    email: string()
      .required("This field is required")
      .email("Invalid email format")
      .trim(),
    role: string().required("Role is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(editSchema),
    defaultValues: {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
    },
  });

  const getUsers = async (search) => {
    try {
      const res = await fetch(`/api/admin/users?search=${search}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setUsers(data.users);
    } catch (err) {
      console.error(err.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getUsers(search);
  }, [search]);

  const handleChange = (e) => {
    setTimeout(() => {
      setSearch(e.target.value);
    }, 1500);
  };

  const updateInfoMu = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result) => {
      const updatedUser = result.user;
      setUsers((prev) =>
        prev.map((u) =>
          u._id === editingUser.id ? { ...u, ...updatedUser } : u,
        ),
      );
      toast.success("User updated successfully");
      setEditingUser({ id: "", name: "", email: "", role: "" });
      closeModal();
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  const onSubmit = (data) => {
    updateInfoMu.mutate(data);
    
  };

  const openModal = (user) => {
    setEditingUser({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const deleteMu = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      return id;
    },
    onSuccess: (id) => {
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast.success("User deleted successfully");
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  const handleDelete = (id) => {
    deleteMu.mutate(id);
  };

  if (isError) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-xl font-bold text-gray-500">Sorry, something went wrong</p>
      </div>
    );
  }

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
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-center mb-12">
          <h1 className="text-3xl font-extrabold text-indigo-900 px-2">
            Manage <span className="text-purple-800">Users</span>
          </h1>
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => handleChange(e)}
            className="py-1.5 max-w-52 px-2 border-2 focus:outline-0 focus:shadow-sm focus:border-amber-500 border-gray-300 rounded-2xl text-lg text-gray-600"
          />
        </div>

        <div className="md:hidden flex flex-col gap-4">
          {users.map((user, index) => (
            <div
              key={user._id}
              className="bg-linear-to-br from-white/60 via-purple-100/40 to-pink-100/60 backdrop-blur-md rounded-xl p-4 shadow-sm"
            >
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                <span className="font-semibold text-gray-500">#</span>
                <span>{index + 1}</span>

                <span className="font-semibold text-gray-500">Name</span>
                <span>{user.name}</span>

                <span className="font-semibold text-gray-500">Email</span>
                <span className="break-all">{user.email}</span>

                <span className="font-semibold text-gray-500">Phone</span>
                <span>{user.phone || "—"}</span>

                <span className="font-semibold text-gray-500">Role</span>
                <span
                  className={
                    user.role === "admin"
                      ? "text-red-500 font-medium"
                      : "text-blue-500 font-medium"
                  }
                >
                  {user.role}
                </span>

                <span className="font-semibold text-gray-500">Joined</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>

                <span className="font-semibold text-gray-500">Actions</span>
                <span className="flex gap-2">
                  <button
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    className="bg-white p-2 rounded-lg hover:scale-110 transition-transform"
                  >
                    <MdEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 p-2 rounded-lg hover:scale-110 transition-transform"
                  >
                    <MdDelete className="fill-white" />
                  </button>
                </span>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-gray-500 py-8">No users found.</p>
          )}
        </div>

        

        <div className="hidden md:inline-block rounded-xl bg-linear-to-br from-white/60 via-purple-100/40 to-pink-100/60 backdrop-blur-md ">
          <table className="w-full min-w-175 table-auto">
            <thead>
              <tr>
                <th className="py-4 px-8">#</th>
                <th className="py-4 px-8">Name</th>
                <th className="py-4 px-8">Email</th>
                <th className="py-4 px-8">Phone</th>
                <th className="py-4 px-8">Role</th>
                <th className="py-4 px-8">Joined</th>
                <th className="py-4 px-8">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/30 transition duration-200 border-b-2 border-b-gray-200"
                  >
                    <td className="py-4 px-8 text-gray-500">{index + 1}</td>
                    <td className="py-4 px-8 text-gray-600">{user.name}</td>
                    <td className="py-4 px-8 text-gray-600">{user.email}</td>
                    <td className="py-4 px-8 text-gray-600">{user.phone}</td>
                    <td
                      className={`py-4 px-8 font-medium ${
                        user.role === "admin" ? "text-red-500" : "text-blue-500"
                      }`}
                    >
                      {user.role}
                    </td>
                    <td className="py-4 px-8 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-8 text-gray-600">
                      <button
                        onClick={() => openModal(user)}
                        className="bg-white p-2.5 mr-2.5 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 p-2.5 mr-2.5 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                      >
                        <MdDelete className="fill-white" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-500 text-lg"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          {/* Modal content */}
          <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 p-6 shadow-xl transition-all">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">
                  Name
                </label>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                />
                {errors.email && (
                  <span className="text-xs text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">
                  Role
                </label>
                <select
                  {...register("role")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <span className="text-xs text-red-500">
                    {errors.role.message}
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 cursor-pointer rounded-xl bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={updateInfoMu.isPending}
                  type="submit"
                  className="px-5 py-2.5 cursor-pointer rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition"
                >
                  {updateInfoMu.isPending ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
