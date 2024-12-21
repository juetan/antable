import { Recordable } from './utils'

const isArray = (value: any) => Array.isArray(value)
const isArrayKey = (key: string) => /^\[.*\]$/.test(key)
const isObjectKey = (key: string) => /^\{.*\}$/.test(key)
const isObject = (value: any) => value && typeof value === 'object'
const toArrayKeys = (key: string) => key.replace(/\[|\]|\s/g, '').split(',')
const toObjectKeys = (key: string) =>
  key
    .replace(/\{|\}|\s/g, '')
    .split(',')
    .map(i => i.split(':'))

export function getModel(source: Recordable, target: Recordable = {}) {
  for (let [key, value] of Object.entries(source)) {
    if (isArrayKey(key)) {
      const keys = toArrayKeys(key)
      keys.forEach((key, index) => (target[key] = value?.[index]))
      continue
    }
    if (isObjectKey(key)) {
      const keys = toObjectKeys(key)
      keys.forEach(([v1, v2]) => (target[v2 ?? v1] = value?.[v1]))
      continue
    }
    if (isArray(value)) {
      getModel(value, (target[key] = []))
      continue
    }
    if (isObject(value)) {
      getModel(value, (target[key] = {}))
      continue
    }
    target[key] = value
  }
  return target
}

export function setModel(target: Recordable, source: Recordable) {
  for (let [key] of Object.entries(target)) {
    if (isArrayKey(key)) {
      const keys = toArrayKeys(key)
      target[key] = keys.map(i => source[i])
      continue
    }
    if (isObjectKey(key)) {
      target[key] = {}
      const keys = toArrayKeys(key)
      keys.forEach(([i]) => (target[key][i] = source[i]))
      continue
    }
    if (isArray(source[key])) {
      target[key] = Array(source[key].length)
      setModel(target[key], source[key])
      continue
    }
    if (isObject(source[key])) {
      const entries = Object.keys(source[key]).map(i => [i, undefined])
      target[key] = Object.fromEntries(entries)
      setModel(target[key], source[key])
      continue
    }
    target[key] = source[key] ?? target[key]
  }
  return target
}
