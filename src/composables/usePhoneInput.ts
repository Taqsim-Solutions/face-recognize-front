import { ref, computed } from 'vue'
import {
  parsePhoneNumberFromString,
  getCountryCallingCode,
  type CountryCode
} from 'libphonenumber-js'

// Minimal IANA timeZone -> ISO country mapping. Covers the region this app is
// used in plus common fallbacks; anything unknown defaults to UZ. (Full mapping
// would need a TZ database; this list is intentionally pragmatic.)
const TZ_TO_COUNTRY: Record<string, CountryCode> = {
  'Asia/Tashkent': 'UZ',
  'Asia/Samarkand': 'UZ',
  'Asia/Almaty': 'KZ',
  'Asia/Aqtau': 'KZ',
  'Asia/Aqtobe': 'KZ',
  'Asia/Bishkek': 'KG',
  'Asia/Dushanbe': 'TJ',
  'Asia/Ashgabat': 'TM',
  'Europe/Moscow': 'RU',
  'Europe/Kaliningrad': 'RU',
  'Asia/Novosibirsk': 'RU',
  'Asia/Yekaterinburg': 'RU',
  'Europe/Kiev': 'UA',
  'Europe/Kyiv': 'UA',
  'Europe/Minsk': 'BY',
  'Europe/Istanbul': 'TR',
  'Asia/Baku': 'AZ',
  'Asia/Yerevan': 'AM',
  'Asia/Tbilisi': 'GE'
}

const DEFAULT_COUNTRY: CountryCode = 'UZ'

/** Keep only digits and a single leading '+'. */
export function sanitizePhone(raw: string | null | undefined): string {
  if (!raw) return ''
  let s = String(raw).replace(/[^\d+]/g, '')
  const hasPlus = s.startsWith('+')
  s = s.replace(/\+/g, '')
  return hasPlus ? '+' + s : s
}

/** Calling code prefix for a country, e.g. 'UZ' -> '+998'. */
export function callingCodeFor(country: CountryCode): string {
  try { return '+' + getCountryCallingCode(country) } catch { return '+998' }
}

/** Standalone validity check usable in zod refinements. */
export function isValidPhone(value: string | null | undefined, country?: CountryCode): boolean {
  const v = (value || '').trim()
  if (!v) return false
  const cc = country || detectCountry()
  const parsed = parsePhoneNumberFromString(v, v.startsWith('+') ? undefined : cc)
  return !!parsed?.isValid()
}

/** Normalize to E.164 (+998901234567) for submission; falls back to digits. */
export function toE164(value: string | null | undefined, country?: CountryCode): string {
  const v = (value || '').trim()
  if (!v) return ''
  const cc = country || detectCountry()
  const parsed = parsePhoneNumberFromString(v, v.startsWith('+') ? undefined : cc)
  return parsed?.number || v.replace(/[^\d+]/g, '')
}

/** Best-effort country from the browser's IANA timeZone. Falls back to UZ. */
export function detectCountry(): CountryCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz]
  } catch {
    // ignore — fall through to default
  }
  return DEFAULT_COUNTRY
}

/**
 * Phone input helper.
 * - `model` holds the raw value the user types (digits, optionally leading +).
 * - `sanitize` strips everything except digits and a single leading '+'.
 * - `isValid` validates against the detected (or given) country via libphonenumber.
 * - `e164` returns the normalized +<country><number> string for submission.
 */
export function usePhoneInput(initial = '', country?: CountryCode) {
  const cc = ref<CountryCode>(country || detectCountry())
  const model = ref<string>(initial)

  // Keep only digits and a single leading '+'.
  const sanitize = (raw: string): string => {
    if (!raw) return ''
    let s = String(raw).replace(/[^\d+]/g, '')
    // collapse any '+' that isn't the very first char
    const hasPlus = s.startsWith('+')
    s = s.replace(/\+/g, '')
    return hasPlus ? '+' + s : s
  }

  const onInput = (raw: string) => {
    model.value = sanitize(raw)
  }

  const parsed = computed(() => {
    const v = model.value?.trim()
    if (!v) return null
    // If the user didn't type a country code, parse in the detected country.
    return parsePhoneNumberFromString(v, v.startsWith('+') ? undefined : cc.value)
  })

  const isValid = computed(() => !!parsed.value?.isValid())

  // E.164 (+998901234567) for the API; falls back to the sanitized raw value.
  const e164 = computed(() => parsed.value?.number || sanitize(model.value))

  // A human placeholder for the current country, e.g. "+998 90 123 45 67".
  const callingCode = computed(() => {
    try { return '+' + getCountryCallingCode(cc.value) } catch { return '+998' }
  })

  return { country: cc, model, onInput, sanitize, isValid, e164, callingCode, parsed }
}
