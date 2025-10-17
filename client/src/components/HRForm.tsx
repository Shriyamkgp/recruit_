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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as RecruitApi from "@/api/RecruitApi";

// --- Schema Definition ---
const formSchema = z.object({
  fullName: z.string().min(1, {
    message: "Full Name is required.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, {
    message: "Password should be atleast 6 characters.",
  }),
  phone: z.string(),
  location: z.string().optional(),
  job_designation: z.string().optional(),
});

type HRFormValues = z.infer<typeof formSchema>;

// --- Component ---
export function HRForm() {
  const navigate = useNavigate();

  const form = useForm<HRFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      location: "",
      job_designation: "",
    },
  });

  async function registerUser(reqbody: any) {
    let response = undefined;
    try {
      response = await RecruitApi.registerUser(reqbody);
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
    return response;
  }

  async function loginUser(reqbody: any) {
    let response = undefined;
    try {
      response = await RecruitApi.loginUser(reqbody);
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
    return response;
  }

  // Add API submission logic here to registering HR User
  async function onSubmit(values: HRFormValues) {
    console.log("Form Submitted:", values);

    const reqbody = {
      name: values.fullName,
      email: values.email,
      password: values.password,
      role: "hr",
      profile: {
        phone: values.phone,
        location: "",
        bio: "",
      },
    };

    if (values.location) {
      reqbody.profile.location = values.location;
    }
    if (values.job_designation) {
      reqbody.profile.bio = values.job_designation;
    }

    let response = await registerUser(reqbody);
    if (response) {
      console.log(`Success: ${response._id}`);
      sessionStorage.setItem("hrId", response._id);
      let credentials = { email: values.email, password: values.password };
      let status = await loginUser(credentials);
      if (status) {
        navigate("../hr/create_job");
      }
    } else {
      console.log(`Unsuccessful`);
    }
    return response;
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-xl mt-10">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-900 text-center">
          Recruiter Registration
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {/* PASSWORD */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="minimum 6 characters long."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PHONE NUMBER */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="include country code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LOCATION */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BIOGRAPHY */}
            <FormField
              control={form.control}
              name="job_designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Designation</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Please give your Job Designation."
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
              Register
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
