import { z } from "zod";

export const authFormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres").optional(),
  company_name: z.string().min(2, "El nombre de empresa debe tener al menos 2 caracteres").optional(),
  phone: z.string().optional(),
  is_seller: z.boolean().default(false),
});

export const productFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
  price: z.number().min(0.01, "El precio debe ser mayor a 0"),
  quantity: z.number().min(0.01, "La cantidad debe ser mayor a 0"),
  unit: z.string().min(1, "Selecciona una unidad"),
  location: z.string().min(2, "Ingresa una ubicación válida"),
  condition: z.string().min(1, "Selecciona una condición"),
  allow_direct_purchase: z.boolean().default(true),
});

export const profileFormSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  company_name: z.string().min(2, "El nombre de empresa debe tener al menos 2 caracteres"),
  phone: z.string().optional(),
  location: z.string().optional(),
  sector: z.string().optional(),
  description: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().optional(),
  logo_url: z.string().optional(),
  social_links: z.string().optional(),
  certifications: z.string().optional(),
});