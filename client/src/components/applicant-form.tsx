"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Header from "./Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  fullName: z.string().min(1, {
    message: "Full Name is required.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  // For file upload, we use z.any() as the value will be a File object
  resumeFile: z.any().optional(),
});

export function ApplicantForm() {
  const navigate = useNavigate();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    navigate("../joblist");
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          New Applicant Registration
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. USERNAME FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Displayed on Console" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. FULL NAME FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. EMAIL FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your Email Address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. UPLOAD RESUME FIELD (Unique FormField with custom file handling) */}
            <FormField
              control={form.control}
              name="resumeFile"
              // Destructure the field object and explicitly set 'value' to undefined
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Resume</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      // For file inputs, the 'value' prop must be undefined for the input to work correctly.
                      value={undefined}
                      type="file"
                      onChange={(event) => {
                        // This handles saving the actual File object to the form state
                        onChange(
                          event.target.files ? event.target.files[0] : null
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

            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
