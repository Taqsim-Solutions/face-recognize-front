import * as z from 'zod'

export const step1Schema = z.object({
  phoneNumber: z
    .string({ required_error: 'validation.required-field' })
    .transform((val) => String(val ?? '').replace(/\D/g, ''))
    .refine((v) => /^\d{9}$/.test(v), { message: 'validation.phone-number-should-be-valid' }),

  inn: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? v.replace(/\s+/g, '') : v))
    .refine((v) => !v || /^\d{9}$/.test(v), { message: 'validation.tin-should-be-valid' }),

  passportSerial: z
    .string({ required_error: 'validation.required-field' })
    .transform((v) => (v ?? '').toUpperCase().replace(/[^A-Z]/g, ''))
    .refine((v) => v.length === 2, { message: 'validation.passport-serial-should-be-valid' }),

  passportNumber: z
    .string({ required_error: 'validation.required-field' })
    .transform((v) => (v ?? '').replace(/\D/g, ''))
    .refine((v) => /^\d{7}$/.test(v), { message: 'validation.passport-number-should-be-valid' }),

  pinfl: z
    .string({ required_error: 'validation.required-field' })
    .transform((v) => (v ?? '').replace(/\s+/g, ''))
    .refine((v) => /^\d{14}$/.test(v), { message: 'validation.pinfl-should-be-valid' }),

  accountCredit: z
    .string({ required_error: 'validation.required-field' })
    .transform((v) => (v ?? '').replace(/\s+/g, ''))
    .refine((v) => /^\d{20}$/.test(v), { message: 'validation.account-credit-should-be-valid' }),

  mfo: z
    .string({ required_error: 'validation.required-field' })
    .transform((v) => (v ?? '').replace(/\s+/g, ''))
    .refine((v) => /^\d{5}$/.test(v), { message: 'validation.mfo-should-be-valid' })
})

export type Step1FormValues = z.infer<typeof step1Schema>

export const step2Schema = z.object({
  status: z.enum(['active', 'blocked', 'leftTheCompany'], {
    required_error: 'validation.required-field'
  }),
  salary: z
    .union([z.number(), z.string()])
    .refine((val) => String(val).trim() !== '' && val !== null && val !== undefined, {
      message: 'validation.required-field'
    })
    .transform((s) => Number(String(s).replace(/\s+/g, '')))
    .refine((n) => Number.isFinite(n) && n >= 0, {
      message: 'validation.salary-should-be-valid'
    }),

  percentAllowed: z
    .union([z.number(), z.string(), z.null()])
    .refine((val) => val !== '' && val !== null && val !== undefined, {
      message: 'validation.required-field'
    })
    .transform((val) => Number(val))
    .refine((n) => !isNaN(n), { message: 'validation.required-field' })
    .refine((n) => n >= 0, { message: 'validation.min-allowed-percent-amount' })
    .refine((n) => n <= 80, { message: 'validation.max-allowed-percent-amount' }),

  comment: z.string().optional().nullable(),

  cardNumbers: z
    .array(
      z.object({
        value: z
          .string({ required_error: 'validation.required-field' })
          .transform((v) => (v ?? '').replace(/\s+/g, ''))
          .refine((v) => /^\d{16}$/.test(v), {
            message: 'validation.card-number-should-be-valid'
          })
      })
    )
    .min(1, { message: 'Kamida 1-ta karta kiritilishi kerak' }),

  fte: z
    .union([z.number(), z.string(), z.null()])
    .refine((val) => val !== '' && val !== null && val !== undefined, {
      message: 'validation.required-field'
    })
    .transform((v) => Number(v))
    .refine((n) => !isNaN(n), { message: 'validation.required-field' })
    .refine((n) => n >= 0.1 && n <= 3, { message: 'validation.fte-should-be-valid' })
})

export type Step2SchemaOutput = z.infer<typeof step2Schema>

export type Step2FormValues = {
  status: 'active' | 'blocked' | 'leftTheCompany'
  salary: number | string
  percentAllowed: number | null
  comment?: string | null
  cardNumbers: { value: string }[]
  fte?: number | string
  contractType: 'staff' | 'gph'
}

export type FormValues = Step1FormValues & Step2FormValues
