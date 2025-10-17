import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Clear previous errors

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      console.log("API_URL:", API_URL);
      const loginData = { email, password };

      // 1. Submit login data
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          errorBody.message || "Login failed. Please check your credentials."
        );
      }

      const loginApiResponse = await response.json();
      console.log("loginApiResponse:", loginApiResponse);

      if (loginApiResponse?._id) {
        sessionStorage.setItem("userId", loginApiResponse._id);

        // Store token if available
        if (loginApiResponse.token) {
          sessionStorage.setItem("userToken", loginApiResponse.token);
        }

        // 2. Redirect based on role
        if (loginApiResponse.role === "applicant") {
          navigate("/job/applicant");
        } else if (loginApiResponse.role === "hr") {
          navigate("/hr/posted-jobs"); // Redirect HR users to a dashboard
        } else {
          throw new Error("Login failed. Invalid user role.");
        }
      } else {
        throw new Error("Authentication failed. Missing user ID in response.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Display error message to the user instead of using alert()
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unknown error occurred during login. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-[380px] mx-auto shadow-2xl rounded-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-indigo-700">
            Login to Your Account
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Enter your credentials below to access the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-medium">
                {errorMessage}
              </div>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm text-indigo-600 hover:text-indigo-800 transition underline-offset-4"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging In...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="underline text-indigo-600 hover:text-indigo-800 transition"
              >
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
