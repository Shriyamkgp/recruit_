"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// --- Schema ---
const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  resumeFile: z.any().refine((val) => val instanceof File, {
    message: "A resume file is required.",
  }),
  salaryExpectation: z
    .string()
    .min(1, { message: "e.g., 50000 - 70000 USD" })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

async function LoginUser(email: string, password: string) {
  const API_URL = import.meta.env.VITE_API_URL;
  const registryData = { email, password };

  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registryData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || "Login failed after registration.");
    }

    const loginApiResponse = await response.json();

    if (loginApiResponse) {
      if (loginApiResponse._id) {
        sessionStorage.setItem("userId", loginApiResponse._id);
      }
      if (loginApiResponse.token) {
        sessionStorage.setItem("userToken", loginApiResponse.token);
      }
      return loginApiResponse;
    }
  } catch (error) {
    console.error("Login attempt failed:", error);
  }
}

// Main function to handle registration and profile creation
async function registerApplicant(
  data: FormValues,
  navigate: ReturnType<typeof useNavigate>
) {
  const API_URL = import.meta.env.VITE_API_URL;

  // 1. User Registration
  const registryData = {
    name: data.fullName,
    email: data.email,
    password: data.password,
    role: "applicant",
  };

  let registerApiResponse = null;
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registryData),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.message || "User registration failed.");
    }
    registerApiResponse = await response.json();
  } catch (error) {
    console.error("Registration failed:", error);
    // Add UI feedback here (e.g., a toast notification)
    return;
  }

  // 2. Applicant Profile Creation (requires file upload)
  if (registerApiResponse?._id) {
    const userIdString = registerApiResponse._id;
    const formData = new FormData();
    formData.append("userId", userIdString);
    formData.append("resume", data.resumeFile as File);

    // Parse and append salary expectation if present
    if (data.salaryExpectation) {
      const parts = data.salaryExpectation.split(/[\s-]+/);
      const salaryObject = {
        min: parseInt(parts[0]),
        max: parseInt(parts[2]),
        currency: parts[3] || "USD",
      };
      // Stringify complex object for backend Multer handling
      formData.append("salaryExpectation", JSON.stringify(salaryObject));
    }

    try {
      const profileResponse = await fetch(`${API_URL}/applicants/`, {
        method: "POST",
        body: formData,
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to create applicant profile.");
      }

      // 3. Login and Navigate on success
      const login_status = await LoginUser(data.email, data.password);

      if (login_status) {
        navigate("../job/applicant");
      } else {
        console.error("Navigation failed: User login status missing.");
      }
    } catch (error) {
      console.error("Profile creation or final steps failed:", error);
    }
  }
}

// --- Component ---
export function ApplicantForm() {
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      resumeFile: undefined,
      salaryExpectation: "",
    },
  });

  function onSubmit(values: FormValues) {
    registerApplicant(values, navigate);
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-8 mt-10 bg-white shadow-2xl rounded-xl">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">
          Applicant Registration
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name FIELD */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email FIELD */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password FIELD */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UPLOAD RESUME FIELD */}
            <FormField
              control={form.control}
              name="resumeFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Resume (PDF)</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      value={undefined} // Crucial for file inputs
                      type="file"
                      onChange={(event) => {
                        onChange(
                          event.target.files ? event.target.files[0] : undefined
                        );
                      }}
                      accept=".pdf"
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormDescription>
                    Please upload your resume as a single .pdf file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salary Expectation */}
            <FormField
              control={form.control}
              name="salaryExpectation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Expectation (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., 50000 - 70000 USD"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition duration-200"
            >
              Create Profile & Register
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
