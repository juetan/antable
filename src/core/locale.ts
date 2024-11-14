import { computed, inject, InjectionKey, ref, Ref } from 'vue'

export const langKey = Symbol() as InjectionKey<Ref<string>>

export function useLocale(prefix?: string, localeOverrides?: Record<string, any>) {
  const lang = inject(langKey) ?? ref('zhCN')
  const locale = computed(() => localeOverrides)
  const t = (key: string) => {
    const n = prefix ? `${prefix}.${key}` : key
    if (localeOverrides) {
      return localeOverrides[lang.value][n]
    }
  }
  return { lang, locale, t }
}
