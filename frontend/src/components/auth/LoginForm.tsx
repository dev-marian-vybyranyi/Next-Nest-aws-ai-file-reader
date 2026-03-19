"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usersApi } from "@/lib/api";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { loginSchema } from "../schemas/loginSchema";

export function LoginForm() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: loginSchema,
    onSubmit: async ({ email }, { setSubmitting, setFieldError }) => {
      try {
        await usersApi.upsert(email);
        localStorage.setItem("userEmail", email);
        router.push("/chat");
      } catch {
        setFieldError("email", "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Card className="w-full max-w-md border-white bg-slate-900">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">
          PDF Chat
        </CardTitle>
        <CardDescription className="text-slate-400">
          Enter your email to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-400">{formik.errors.email}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Loading..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
