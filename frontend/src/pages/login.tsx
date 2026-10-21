import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, Store } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router";
import { getAuthUser, userLogin } from "../api/api";
import { getProductsPath, saveUser } from "../utils/authStorage";
import { useAuth } from "../context/Authcontext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInputs = z.infer<typeof loginSchema>;

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [requestError, setRequestError] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });
  const { user, loading, setUser } = useAuth();

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    setRequestError("");

    try {
      const res = await userLogin(data);
      const user = getAuthUser(res.data);
      if (!user) {
        setRequestError("Sign-in succeeded, but the server did not return user details.");
        return;
      }
      setUser(user);
      saveUser(user);
      navigate(getProductsPath(user.role));
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? "Could not sign in. Please try again."
        : "Could not sign in. Please try again.";
      setRequestError(message);
    }
  };

  if (!loading && user) {
    return <Navigate to={getProductsPath(user.role)} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 text-slate-900 sm:px-6">
      <section className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(37,42,78,0.12)]">
        <header className="bg-indigo-600 p-3 sm:p-4">
          <div className="px-2.5 pb-3">
            <div className="mb-2 flex items-center gap-2 text-white">
              <span className="grid size-7 place-items-center rounded-md bg-white text-indigo-600">
                <Store size={15} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="text-sm font-medium tracking-tight">CreateSpace</span>
            </div>
            <h1 className="text-[23px] font-semibold leading-tight tracking-[-0.04em] text-white">
              Welcome back.
            </h1>
            <p className="mt-1 text-[11px] text-indigo-100">Your space is waiting for you. Sign in to continue.</p>
          </div>

          <div
            className="relative h-[202px] overflow-hidden rounded-lg border border-white/30 bg-gradient-to-b from-[#8ec5ff] via-[#c9c3ff] to-[#dda8f1]"
            aria-hidden="true"
          >
            <div className="absolute -left-[14%] top-[40%] h-[145px] w-[115%] rotate-[-19deg] rounded-[50%] border-[15px] border-[#e1fbff]/90 shadow-[0_3px_14px_rgba(255,255,255,0.55)]" />
            <div className="absolute -bottom-[76%] -right-[28%] h-[170%] w-[90%] rotate-[-32deg] rounded-[50%] border-[17px] border-[#dcfaff]/90 shadow-[0_2px_12px_rgba(255,255,255,0.45)]" />
            <div className="absolute left-[19%] top-[30%] size-[66px] rounded-full bg-[radial-gradient(circle_at_32%_25%,#dbffff_0%,#8be9fa_34%,#8d78f4_72%,#684de0_100%)] shadow-[inset_-5px_-8px_12px_rgba(76,49,186,0.25),0_7px_12px_rgba(78,54,185,0.22)]" />
            <div className="absolute left-[16%] top-[57%] size-[31px] rounded-full bg-[radial-gradient(circle_at_32%_25%,#e2ffff,#7beaf9_38%,#9879fa_75%,#6d52de)] shadow-[inset_-3px_-4px_7px_rgba(76,49,186,0.25),0_5px_8px_rgba(78,54,185,0.2)]" />
            <div className="absolute left-[33%] top-[27%] size-5 rounded-full bg-[radial-gradient(circle_at_32%_25%,#e5ffff,#86e9fa_45%,#8c72f4_80%)] shadow-[0_3px_6px_rgba(78,54,185,0.2)]" />
            <div className="absolute left-[16%] top-[17%] size-[42px] rounded-full bg-[radial-gradient(circle_at_32%_25%,#e6ffff,#93e9fa_43%,#9382f4_83%)] shadow-[0_4px_8px_rgba(78,54,185,0.2)]" />
            <div className="absolute bottom-[17%] left-[10%] h-7 w-16 rounded-[50%] border-b-[5px] border-indigo-700 bg-gradient-to-r from-cyan-200 via-indigo-100 to-cyan-200 shadow-[0_5px_8px_rgba(78,54,185,0.25)]" />

            <div className="absolute right-[7%] top-[13%] h-[75%] w-[36%] rounded-lg border border-white/60 bg-white/35 p-3 shadow-[0_8px_20px_rgba(85,74,166,0.13)] backdrop-blur-[2px]">
              <div className="mx-auto mt-1 grid size-5 place-items-center rounded-md bg-white/70 text-indigo-500">
                <Check size={13} aria-hidden="true" />
              </div>
              <p className="mt-2 text-center text-[6px] font-medium text-slate-600">Sign in to arrive</p>
              <div className="mt-2 h-3 rounded bg-white/80" />
              <div className="mt-1 h-3 rounded bg-white/80" />
              <div className="mx-auto mt-3 h-3 w-1/2 rounded-full bg-slate-950" />
              <div className="mt-3 h-px bg-white/50" />
              <div className="mx-auto mt-1.5 h-1 w-2/3 rounded bg-white/70" />
            </div>
          </div>
        </header>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-2.5 px-5 pb-4 pt-3 sm:px-6"
        >
          {requestError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              {requestError}
            </p>
          )}
          <div>
            <h2 className="text-base font-medium leading-5 text-slate-800">Sign in</h2>
            <p className="mt-0.5 text-[10px] text-slate-500">Enter your credentials to access your account.</p>
          </div>

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
            {errors.email && <span className="mt-1 block text-xs font-normal text-red-600">{errors.email.message}</span>}
          </label>

          <label className="block text-[11px] font-medium text-slate-700" htmlFor="password">
            <span className="flex items-center justify-between">
              Password
              <a className="font-normal text-indigo-600 hover:text-indigo-700" href="/forgot-password">
                Forgot password?
              </a>
            </span>
            <span className="mt-1 block">
              <span className="flex h-[38px] items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <LockKeyhole size={15} aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
                <button
                  className="grid size-6 place-items-center rounded text-slate-400 transition hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-500"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </span>
            </span>
            {errors.password && <span className="mt-1 block text-xs font-normal text-red-600">{errors.password.message}</span>}
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-slate-600">
            <input className="peer sr-only" type="checkbox" name="remember" id="remember" />
            <span className="grid size-3 items-center justify-center rounded-[3px] border border-slate-300 text-transparent peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-200">
              <Check size={9} strokeWidth={3} aria-hidden="true" />
            </span>
            Remember me
          </label>

          <button
            className="flex h-[38px] w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 text-[11px] font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-800"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"} <ArrowRight size={13} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2 text-[9px] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            OR
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            className="flex h-[34px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-[10px] font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            type="button"
          >
            <span className="grid size-4 place-items-center rounded-full border border-slate-500 text-[10px] font-semibold leading-none">
              G
            </span>
            Continue with Google
          </button>

          <p className="pt-0.5 text-center text-[10px] text-slate-500">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-indigo-600 hover:text-indigo-700" to="/register">
              Sign up
            </Link>
          </p>
          <p className="text-center text-[9px] text-slate-400">Secure sign-in. Your privacy matters.</p>
        </form>
      </section>
    </main>
  );
}

export default Login;