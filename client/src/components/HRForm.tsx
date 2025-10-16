"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
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

// --- Schema Definition ---
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  fullName: z.string().min(1, {
    message: "Full Name is required.",
  }),
  company: z.string().optional(),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  jobdescriptionFile: z.any().optional(),
});

type HRFormValues = z.infer<typeof formSchema>;

// --- Component ---
export function HRForm() {
  const navigate = useNavigate();

  const form = useForm<HRFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      company: "",
      email: "",
      jobdescriptionFile: undefined,
    },
  });

  function onSubmit(values: HRFormValues) {
    console.log("Form Submitted:", values);
    // Add API submission logic here to register HR and upload job description
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-xl mt-10">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">
          HR Registration & Job Post
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* USERNAME FIELD */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Unique username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* FULL NAME FIELD */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="HR Manager Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* COMPANY FIELD */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMAIL FIELD */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="company.email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UPLOAD JOB DESCRIPTION FIELD */}
            <FormField
              control={form.control}
              name="jobdescriptionFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Job Description (PDF)</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      value={undefined}
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
                    The job description must be a single .pdf file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition duration-200"
            >
              Register HR & Post Job
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
