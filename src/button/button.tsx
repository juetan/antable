import { ButtonProps } from "@arco-design/web-vue"
import { MaybeRefOrGetter, VNodeChild } from "vue"

export interface AnButton extends Omit<ButtonProps, 'disabled'> {
  icon?: string | ((item: AnButton) => VNodeChild)
  text?: string | ((item: AnButton) => VNodeChild)
  sort?: number
  disable?: MaybeRefOrGetter<boolean> | ((item: AnButton) => boolean)
  visible?: MaybeRefOrGetter<boolean> | ((item: AnButton) => boolean)
  render?: (item: AnButton) => VNodeChild
  onClick?: () => void
}
