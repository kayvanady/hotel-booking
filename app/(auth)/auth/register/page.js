"use client";

import { useMutation } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { object, string } from "yup";

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [timer, setTimer] = useState(60);
  const [resend, setResend] = useState(false);
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputRefs = useRef([]);

  const registerSchema = object({
    name: string()
      .required("This field is required")
      .min(3, "At least 3 characters needed")
      .trim(),
    email: string()
      .required("This field is required")
      .email("Invalid email format")
      .trim(),
    phone: string()
      .required("This field is required")
      .matches(/^09\d{9}$/, "Phone number must be 11 digits starting with 09"),
    password: string()
      .required("This field is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const otpCompleted = otp.every((digit) => digit !== "");

  useEffect(() => {
    if (isCodeSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isCodeSent]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const registerMu = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/auth/sms/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_, variables) => {
      setPhone(variables.phone);
      setFormData(variables);      
      toast.success("OTP code sent successfully");
      setIsCodeSent(true);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const verifyOtpMu = useMutation({
    mutationFn: async () => {
      const otpCode = otp.join("");
      const res = await fetch("/api/auth/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Logged in successfully!");
      if (data?.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data?.user?.role === "user") {
        router.push("/user/profile");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data) => {
    registerMu.mutate(data);
  };

  const handleBack = () => {
    setIsCodeSent(false);
    setTimer(60);
    setResend(false);
    setPhone("");
    setOtp(["", "", "", "", ""]);  
    setFormData(null);
  };

  const handleResend = () => {
    if (!formData) return;
    registerMu.mutate(formData);
    setTimer(60);
    setResend(false);              
  };

  const handleInputChange = (index, e) => {
    const value = e.target.value;
    if (value.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 4) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  
  useEffect(() => {
    let interval;
    if (isCodeSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setResend(true);
    }
    return () => clearInterval(interval);
  }, [isCodeSent, timer]);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 flex justify-center items-center p-4">
      {!isCodeSent ? (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Welcome
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Name
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
              />
              {errors.name && (
                <span className="text-xs text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Phone */}
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

            {/* Password */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-amber-600 transition-colors duration-200"
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
              disabled={registerMu.isPending}
              className="w-full bg-linear-to-r cursor-pointer from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:from-amber-600 hover:to-orange-700 hover:shadow-lg transform hover:scale-[1.02] active:scale-100 flex items-center justify-center gap-2"
            >
              {registerMu.isPending ? <FaSpinner className="animate-spin" /> : "Register"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-amber-600 font-medium">
              Login
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white py-4 px-5 rounded-2xl shadow-xl hover:shadow-2xl transition w-full duration-300 max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent my-2">
              Verify Your Phone
            </h1>
            <p className="text-gray-700 mb-4 mt-5">
              We sent a 5‑digit code to{" "}
              <strong className="font-mono text-gray-400">{phone}</strong>
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onChange={(e) => handleInputChange(idx, e)}
                className="w-14 h-14 text-center rounded-xl border-2 border-gray-300 focus:ring-2 focus:border-transparent focus:ring-amber-400 outline-none"
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={otp[idx]}
              />
            ))}
          </div>

          <div className="text-center mt-4">
            {!resend ? (
              <p>
                Resend code in <span className="text-amber-600">{timer}</span> seconds
              </p>
            ) : (
              <p className="text-gray-600">
                Didn't get the code?{" "}
                <span
                  onClick={handleResend}
                  className="text-amber-600 hover:text-orange-700 cursor-pointer"
                >
                  Resend
                </span>
              </p>
            )}
          </div>

          <button
            onClick={() => verifyOtpMu.mutate()}
            disabled={!otpCompleted || verifyOtpMu.isPending}
            className="w-full bg-linear-to-r cursor-pointer disabled:bg-gray-500 from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:from-amber-600 hover:to-orange-700 hover:shadow-lg transform hover:scale-[1.01] active:scale-100 flex items-center justify-center gap-2 mt-4"
          >
            {verifyOtpMu.isPending ? <FaSpinner className="animate-spin" /> : "Verify Code"}
          </button>

          <p className="text-center my-4 text-gray-500">
            Wrong phone?{" "}
            <span
              onClick={handleBack}
              className="text-amber-600 cursor-pointer hover:text-orange-700"
            >
              Edit phone
            </span>
          </p>
        </div>
      )}
    </div>
  );
}