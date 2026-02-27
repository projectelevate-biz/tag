"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { createInquiry } from "@/lib/relay/contact";

const formSchema = z.object({
  senderName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  senderEmail: z.string().email("Invalid email address"),
  senderTitle: z.string().optional(),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must not exceed 200 characters"),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must not exceed 2000 characters"),
});

interface ContactConsultantFormProps {
  consultantId: string;
  consultantName: string;
  onSuccess?: () => void;
}

export function ContactConsultantForm({
  consultantId,
  consultantName,
  onSuccess,
}: ContactConsultantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderName: "",
      senderEmail: "",
      senderTitle: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await createInquiry({
        consultantId,
        ...values,
      });
      toast.success(`Your message has been sent to ${consultantName}`);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to send inquiry:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Contact {consultantName}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Send a message to inquire about their availability and services.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="senderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Dr. Jane Smith"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senderEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="jane.smith@university.edu"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="senderTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., VP of Enrollment, Dean of Students"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Inquiry: Enrollment Strategy Consulting"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message *</FormLabel>
                <FormDescription>
                  Describe your project, timeline, and what you're looking for.
                </FormDescription>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="We are looking for assistance with..."
                    className="min-h-[150px]"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground">
                    {field.value.length} / 2000
                  </span>
                </div>
              </FormItem>
            )}
          />

          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            By sending this message, you agree to our Terms of Service. The
            consultant will receive your contact information and can respond
            directly.
          </p>
        </form>
      </Form>
    </div>
  );
}
