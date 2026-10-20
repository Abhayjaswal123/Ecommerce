import { useState } from "react";
import axios from "axios";
import { ArrowRight, Eye, LockKeyhole, Mail, Store, UserRound } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthUser, userRegister } from "../api/api";
import { saveUser } from "../utils/authStorage";
import { useAuth } from "../context/Authcontext";

export const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  email: z.string().email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),

  role: z.enum(["user", "vendor"]),
});

type Inputs = z.infer<typeof userSchema>;

function Register() {
  const navigate = useNavigate();
  const [requestError, setRequestError] = useState("");
  const { user: currentUser, loading, setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "user",
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setRequestError("");

    try {
      const res = await userRegister(data);
      const user = getAuthUser(res.data) ?? {
        username: data.username,
        email: data.email,
        role: data.role ?? "user",
      };
      setUser(user);
      saveUser(user);
      navigate("/home");
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? "Could not create your account. Please try again."
        : "Could not create your account. Please try again.";
      setRequestError(message);
    }
  };

  if (!loading && currentUser) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 text-slate-900 sm:px-6">
      <section className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(37,42,78,0.12)]">
        <header className="bg-indigo-600 p-3 sm:p-4">
          <div className="rounded-t-xl bg-indigo-600 px-2.5 pb-3">
            <div className="mb-2 flex items-center gap-2 text-white">
              <span className="grid size-7 place-items-center rounded-md bg-white text-indigo-600">
                <Store size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium tracking-tight">CreateSpace</span>
            </div>
            <h1 className="text-[23px] font-semibold leading-tight tracking-[-0.04em] text-white">
              Create your account
            </h1>
            <p className="mt-1 text-[11px] text-indigo-100">Your next chapter starts here.</p>
          </div>

          <div
            className="relative h-[202px] overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-[#e9e8f2] via-[#d7d5e8] to-[#c7c4dc]"
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#bdb9d2]/80 to-transparent" />
            <div className="absolute -top-12 left-[22%] size-[106px] rounded-full bg-[radial-gradient(circle_at_32%_30%,#eeedf7_0%,#c5c1dc_54%,#a9a3c8_100%)] shadow-[inset_-7px_-8px_14px_rgba(111,105,153,0.2)]" />
            <div className="absolute left-[4%] top-[31%] size-10 rounded-full bg-[radial-gradient(circle_at_30%_28%,#efedf8,#bcb6d7_70%,#a49dbf)] shadow-[inset_-3px_-4px_7px_rgba(111,105,153,0.2)]" />
            <div className="absolute -right-3 top-[15%] size-10 rounded-full bg-[radial-gradient(circle_at_30%_28%,#efedf8,#bcb6d7_70%,#a49dbf)] shadow-[inset_-3px_-4px_7px_rgba(111,105,153,0.2)]" />
            <div className="absolute right-[7%] top-[48%] size-[67px] rounded-full bg-[radial-gradient(circle_at_30%_28%,#efedf8,#bcb6d7_70%,#a49dbf)] shadow-[inset_-5px_-6px_10px_rgba(111,105,153,0.22)]" />
            <div className="absolute left-[56%] top-[32%] size-10 rounded-full border border-white/50 bg-[radial-gradient(circle_at_35%_30%,#f5f4fa,#d2d0e1_64%,#aaa7bb)] shadow-[0_2px_3px_rgba(82,78,113,0.3)]" />
            <div className="absolute left-[35%] top-[55%] size-3.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f5f4fa,#bcb7d4_70%,#aaa4c3)] shadow-sm" />
            <div className="absolute left-[16%] top-[54%] size-5 rounded-full border border-white/70 bg-[radial-gradient(circle_at_35%_30%,#fff,#d2d2df_75%,#b8b8c8)] shadow-sm" />
            <div className="absolute right-[15%] top-[23%] size-3.5 rounded-full border border-white/60 bg-[radial-gradient(circle_at_35%_30%,#fff,#d5d4df_72%,#a9a8b7)] shadow-sm" />
            <div className="absolute bottom-3 left-[6%] h-10 w-14 rounded-t-full bg-[radial-gradient(ellipse_at_40%_20%,#e8e6f2,#bcb7d5_75%,#a7a1c4)] shadow-[0_6px_8px_rgba(98,91,137,0.22)]" />
            <div className="absolute bottom-2 left-[34%] h-7 w-[31%] rounded-[50%] border-b-[7px] border-[#aaa5c6] bg-[#e7e5f0] shadow-[0_6px_8px_rgba(98,91,137,0.2)]" />
            <div className="absolute -bottom-5 right-[16%] size-12 rounded-full border-2 border-white/45 bg-[radial-gradient(circle_at_40%_35%,#eeedf6,#cbc8dd_72%,#aaa6c0)] shadow-[inset_0_3px_5px_rgba(255,255,255,0.45)]" />
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 px-5 pb-4 pt-3 sm:px-6">
          {requestError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {requestError}
            </p>
          )}
          <label className="block text-[11px] font-medium text-slate-700" htmlFor="username">
            Username
            <span className="mt-1 block">
              <span className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <UserRound size={15} aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                  id="username"
                  {...register("username")}
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                />
              </span>
            </span>
            {errors?.username && (<p className="text-red-500 font-normal text-sm">{errors?.username?.message}</p>) }
          </label>

          <label className="block text-[11px] font-medium text-slate-700" htmlFor="email">
            Email address
            <span className="mt-1 block">
              <span className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <Mail size={15} aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                  id="email"
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </span>
            </span>
            {errors?.email && (<p className="text-red-500 font-normal text-sm">{errors?.email?.message}</p>) }
          </label>

          <label className="block text-[11px] font-medium text-slate-700" htmlFor="password">
            Password
            <span className="mt-1 block">
              <span className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <LockKeyhole size={15} aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                  id="password"
                  {...register("password")}
                  type="password"
                  placeholder="Create a password"
                />
                <button
                  className="grid size-6 place-items-center rounded text-slate-400 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-500"
                  type="button"
                  aria-label="Show password"
                >
                  <Eye size={14} />
                </button>
              </span>
            </span>
            {errors?.password && (<p className="text-red-500 font-normal text-sm">{errors?.password?.message}</p>) }
          </label>

          <label className="block text-[11px] font-medium text-slate-700" htmlFor="role">
            Role
            <span className="mt-1 block">
              <span className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <select
                  className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none"
                  id="role"
                  {...register("role")}
                  defaultValue="user"
                >
                  <option value="user">User</option>
                  <option value="vendor">Vendor</option>
                </select>
              </span>
            </span>
            {errors?.role && <p className="text-red-500 font-normal text-sm">{errors.role.message}</p>}
          </label>

          <button
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-[11px] font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
            {!isSubmitting && <ArrowRight size={13} aria-hidden="true" />}
          </button>

          <p className="pt-0.5 text-center text-[10px] text-slate-500">
            Already have an account?{" "}
            <Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/login">
              Sign in
            </Link>
          </p>
          <p className="text-center text-[9px] text-slate-400">
            By signing up, you agree to our{" "}
            <a className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600" href="/terms">
              Terms
            </a>{" "}
            &amp;{" "}
            <a className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600" href="/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;