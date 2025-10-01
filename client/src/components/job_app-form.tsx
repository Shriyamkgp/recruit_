"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Header from "./Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
  salary: z.string().min(1, {
    message: "Salary Expectation is required.",
  }),
  resumeFile: z.any().optional(),
});

type JobApplicationSchema = z.infer<typeof formSchema>;

interface JobDetailsProps {
  jobId_ai?: string;
}

export function JobDetailF({ jobId_ai }: JobDetailsProps) {
  const navigate = useNavigate();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      resumeFile: undefined,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.

    // ✅ This will be type-safe and validated.
    console.log(values);

    localStorage.setItem(`${jobId_ai}`, true as unknown as string);

    if (jobId_ai) {
      navigate(`/ai-${jobId_ai}`);
    }
  }

  return (
    <>
      <div className="">
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

            {/* 3. EMAIL FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your Company Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. COMPANY FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Expectation</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your current company (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. Select resume from the Uploaded file) */}
            <FormField
              control={form.control}
              name="resumeFile"
              // Destructure the field object and explicitly set 'value' to undefined
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Select Resume</FormLabel>
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
