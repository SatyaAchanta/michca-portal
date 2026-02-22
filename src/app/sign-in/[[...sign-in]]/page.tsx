"use client";

import { useEffect, useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/themes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const AUTH_MODE = {
  signIn: "sign-in",
  signUp: "sign-up",
} as const;

const SignInPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDark, setIsDark] = useState(false);
  const appearanceTheme = isDark ? [shadcn, dark] : shadcn;
  const mode = searchParams.get("mode") === AUTH_MODE.signUp ? AUTH_MODE.signUp : AUTH_MODE.signIn;

  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      setIsDark(root.classList.contains("dark"));
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  const setMode = (nextMode: (typeof AUTH_MODE)[keyof typeof AUTH_MODE]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextMode === AUTH_MODE.signIn) {
      params.delete("mode");
    } else {
      params.set("mode", AUTH_MODE.signUp);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <section className="w-full">
      <div className="mx-auto mb-6 max-w-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome to MichCA</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose how you want to continue.</p>
      </div>

      <div className="mx-auto mb-6 grid max-w-sm grid-cols-2 gap-2 rounded-xl border border-border bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode(AUTH_MODE.signIn)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === AUTH_MODE.signIn
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode(AUTH_MODE.signUp)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === AUTH_MODE.signUp
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign up
        </button>
      </div>

      <div className="flex justify-center">
        {mode === AUTH_MODE.signIn ? (
          <SignIn
            routing="virtual"
            signUpUrl="/sign-in?mode=sign-up"
            appearance={{ theme: appearanceTheme }}
          />
        ) : (
          <SignUp
            routing="virtual"
            signInUrl="/sign-in"
            appearance={{ theme: appearanceTheme }}
          />
        )}
      </div>
    </section>
  );
};

export default SignInPage;
