import { mergeWith } from 'lodash-es'
import { ref } from 'vue'

// export class AnConfig<T extends AnConfigBase = AnConfigBase> {
//   readonly config: T

//   constructor() {
//     this.config = { plugins: [], name: '' } as unknown as T
//     this.usePlugin = this.usePlugin.bind(this)
//     this.setConfig = this.setConfig.bind(this)
//   }

//   usePlugin(...args: T['plugins']) {
//     args = args.filter(i => typeof i === 'function')
//     this.config.plugins.push(...args)
//     return this
//   }

//   setConfig(arg: DeepPartial<T>) {
//     mergeWith(this.config, arg, (to, from) => {
//       if (Array.isArray(to) && Array.isArray(from)) {
//         return to.concat(from)
//       }
//     })
//     return this
//   }
// }

export function applyConfigTo(obj: any) {
  const config = {
    name: '',
    plugins: [] as any[],
    lang: ref('zh-CN'),
    locale: {} as Record<string, any>,
  }
  const usePlugin = (...args: any[]) => {
    // args = args.filter(i => typeof i === 'function')
    config.plugins.push(...args)
    return
  }
  const setConfig = (arg: any) => {
    mergeWith(config, arg, (to, from) => {
      if (Array.isArray(to) && Array.isArray(from)) {
        return to.concat(from)
      }
    })
  }
  const setLocale = (name: string, locale: any) => {
    config.locale[name] = locale
  }
  const setLang = (lang: string) => {
    config.lang.value = lang
  }
  const t = (key: string) => {
    return key
  }
  obj.config = config
  obj.usePlugin = usePlugin
  obj.setConfig = setConfig
  obj.setLocale = setLocale
  obj.setLang = setLang
  obj.t = t
}
