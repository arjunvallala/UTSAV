import { z } from "zod";
export const TaskSchema = z.object({
  id: z.string().max(100),
  title: z.string().min(1).max(160),
  category: z.string().min(1).max(60),
  dueDate: z.iso.date(),
  status: z.enum(["done", "in-progress", "upcoming", "overdue"]),
  critical: z.boolean(),
  dependsOn: z.array(z.string().max(100)).max(200).default([]),
});
export const VendorSchema = z.object({
  id: z.string().max(100),
  name: z.string().max(160),
  category: z.string().min(1).max(60),
  status: z.enum(["researching", "contacted", "quoted", "booked", "paid"]),
  quote: z.number().nonnegative().max(1_000_000_000_000).nullable(),
  budget: z.number().nonnegative().max(1_000_000_000_000),
  deposit: z.number().nonnegative().max(1_000_000_000_000).default(0),
  paidAmount: z.number().nonnegative().max(1_000_000_000_000).default(0),
  contact: z.string().max(200).optional(),
});
export const EventSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().max(100),
  name: z.string().min(1).max(100),
  type: z.enum(["Wedding", "Birthday", "Anniversary", "Community event"]),
  date: z.iso.date(),
  city: z.string().max(100),
  guestCount: z.number().int().min(1).max(10000),
  budget: z.number().positive().max(1_000_000_000_000),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),
  theme: z.string().max(100),
  style: z.string().max(100),
  language: z.enum(["English", "Hindi", "Telugu"]).default("English"),
  preferences: z.array(z.string().max(120)).max(20).default([]),
  dietary: z.array(z.string().max(120)).max(20).default([]),
  accessibility: z.array(z.string().max(120)).max(20).default([]),
  actualSpend: z.number().nonnegative().max(1_000_000_000_000),
  tasks: z.array(TaskSchema),
  vendors: z.array(VendorSchema),
  pinnedIdeas: z.array(z.string().max(200)).max(50).default([]),
});
export type EventPlan = z.infer<typeof EventSchema>;
