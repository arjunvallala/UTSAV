import { z } from "zod";
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  dueDate: z.string(),
  status: z.enum(["done", "in-progress", "upcoming", "overdue"]),
  critical: z.boolean(),
  dependsOn: z.array(z.string()).default([]),
});
export const VendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  status: z.enum(["researching", "contacted", "quoted", "booked", "paid"]),
  quote: z.number().nonnegative().nullable(),
  budget: z.number().nonnegative(),
  contact: z.string().optional(),
});
export const EventSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  name: z.string().min(1).max(100),
  type: z.enum(["Wedding", "Birthday", "Anniversary", "Community event"]),
  date: z.string(),
  city: z.string().max(100),
  guestCount: z.number().int().min(1).max(10000),
  budget: z.number().positive(),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),
  theme: z.string().max(100),
  style: z.string().max(100),
  language: z.enum(["English", "Hindi", "Telugu"]).default("English"),
  preferences: z.array(z.string()).default([]),
  dietary: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
  actualSpend: z.number().nonnegative(),
  tasks: z.array(TaskSchema),
  vendors: z.array(VendorSchema),
  pinnedIdeas: z.array(z.string()).default([]),
});
export type EventPlan = z.infer<typeof EventSchema>;
