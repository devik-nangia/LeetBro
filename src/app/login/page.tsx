import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#262626] border border-[#333] rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 bg-[#FFA116]/10 p-3 rounded-xl">
            <Code2 className="h-10 w-10 text-[#FFA116]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to Leet<span className="text-[#FFA116]">Bro</span>
          </h1>
          <p className="text-muted-foreground text-center">
            Sign in to start thinking algorithmically and track your interview prep progress.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
          className="w-full"
        >
          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-gray-100 font-medium text-base h-12 flex items-center justify-center gap-3 transition-colors"
          >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              fill="#EA4335"
              d="M12 5.04c1.84 0 3.33.63 4.6 1.8l3.43-3.41C18.15 1.7 15.35.5 12 .5 7.42.5 3.42 3.14 1.34 7.02l4.02 3.12c1.08-3.18 4.09-5.1 7.64-5.1z"
            />
            <path
              fill="#4285F4"
              d="M23.51 12.28c0-.85-.08-1.57-.2-2.28H12v4.45h6.61c-.34 1.55-1.28 2.76-2.5 3.51v2.9h4.04c2.37-2.18 3.36-5.4 3.36-8.58z"
            />
            <path
              fill="#FBBC05"
              d="M5.36 10.14c-.28.84-.44 1.74-.44 2.66s.16 1.82.44 2.66l-4.02 3.12C.48 16.71.05 14.41.05 12c0-2.41.44-4.71 1.29-6.58l4.02 3.12z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.35 0 6.16-1.12 8.21-3.03l-4.04-2.9c-1.13.78-2.6 1.25-4.17 1.25-3.55 0-6.56-1.92-7.64-5.1l-4.02 3.12c2.08 3.88 6.08 6.66 10.66 6.66z"
            />
          </svg>
            Continue with Google <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <p className="mt-8 text-xs text-center text-[#888] leading-relaxed">
          By signing in, you agree to our Terms of Service and Privacy Policy. We&apos;ll only use your email to create your account.
        </p>
      </div>
    </div>
  );
}
