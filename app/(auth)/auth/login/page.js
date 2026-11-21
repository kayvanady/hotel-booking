"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { object, string } from "yup";

export default function LoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);

  const loginSchema = object({
    phone: string()
      .required("This field is required")
      .matches(/^09\d{9}$/, "Phone number must be 11 digits starting with 09"),
    password: string()
      .required("This field is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/auth/sms/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }
      return result;
    },
    onSuccess: (data) => {
      toast.success("Logged in successfully!");
      if (data?.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Phone Number
            </label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="09123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
            />
            {errors.phone && (
              <span className="text-xs text-red-500">
                {errors.phone.message}
              </span>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                autoComplete="off"
                {...register("password")}
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 flex items-center cursor-pointer pr-4 text-gray-400 hover:text-amber-600 transition-colors duration-200"
              >
                {showPass ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-linear-to-r cursor-pointer from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:from-amber-600 hover:to-orange-700 hover:shadow-lg transform hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-amber-600 hover:underline font-medium cursor-pointer"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
