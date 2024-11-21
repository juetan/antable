import { defaultsDeep, isArray, mergeWith } from 'lodash-es'
import { MaybeRefOrGetter, toValue } from 'vue'

export type MaybePromise<T = void> = T | Promise<T>
export type Recordable = Record<string, any>
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T

export const mergeOrDefaults = (target: any, source: any, mode?: 'defaults' | 'merge') => {
  if (mode === 'defaults') {
    defaultsDeep(target, source)
    return
  }
  mergeWith(target, source, (val, argVal) => {
    if (isArray(val) && isArray(argVal)) {
      val.push(...argVal)
      return val
    }
  })
}

export const toBool = (value: MaybeRefOrGetter<boolean> | ((...args: any[]) => boolean), ...args: any[]) => {
  return Boolean(typeof value === 'function' ? value(...args) : toValue(value))
}

export const mapSlots = (slots: Record<string, (...args: any[]) => any>, ...args: any[]) => {
  for (const [key, fn] of Object.entries(slots ?? {})) {
    if (fn) {
      slots[key] = (...argv: any[]) => fn(...args, ...argv)
    }
  }
  return slots
}

export const arraify = <T = any>(arg: T | T[]) => {
  return Array.isArray(arg) ? arg : [arg]
}

export const useUniqueId = (() => {
  let i = 0
  return () => String(++i)
})()

export const maybeFn = (value: any | ((...args: any[]) => any), ...args: any[]) => {
  return typeof value === 'function' ? value(...args) : value
}
