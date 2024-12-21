import { Modal } from '@arco-design/web-vue'
import { defaultsDeep, pick } from 'lodash-es'
import { AnForm, defineFormPlugin } from './form'
import { Recordable } from '../core'

declare module './form' {
  type BaseModalProps = InstanceType<typeof Modal>['$props'] & {}
  type BaseModalSlots = { default?: any; title?: any; footer?: any }

  interface UseFormModal {
    /**
     * 弹窗标题
     * @by modal
     * @example
     * ```ts
     * '新增'
     * ```
     */
    title?: string
    /**
     * 弹窗宽度
     * @by modal
     * @example
     * ```ts
     * '480px'
     * ```
     */
    width?: number | string
    /**
     * 传递给 Modal 组件的额外 props
     * @by modal
     * @see https://arco.design/vue/component/modal#API
     */
    modalProps?: Omit<BaseModalProps, 'title' | 'width' | 'visible'>
    /**
     * 传递给 Modal 组件的额外 slots
     * @by modal
     * @see https://arco.design/vue/component/modal#API
     */
    modalSlots?: BaseModalSlots
  }
  interface AnFormModal {
    title: string
    width: number | string
    visible: boolean
    modalProps: BaseModalProps
    modalSlots: BaseModalSlots
  }

  interface AnForm {
    /**
     * 打开弹窗。注意：仅在包含 modal 参数可用。
     * @by modal
     */
    openModal: (data?: Recordable) => void
  }
  interface UseFormOptions {
    modal?: UseFormModal
  }
  interface AnFormState {
    modal?: AnFormModal
  }
  interface AnFormConfig {
    modal: UseFormModal
  }
}

AnForm.prototype.openModal = function (data = {}) {
  if (!this.state.modal) {
    return
  }
  this.setModel(data)
  this.state.modal.visible = true
}

function render(this: AnForm) {
  const modal = this.state.modal
  if (!modal) {
    return null
  }
  return (
    <Modal {...modal.modalProps} v-model:visible={modal.visible} title={modal.title} width={modal.width}>
      {{ ...modal.modalSlots }}
    </Modal>
  )
}

const KEYS = ['title', 'width', 'modalProps', 'modalSlots']

async function submit(this: AnForm) {
  try {
    await this.submit()
    return true
  } catch {
    return false
  }
}

export default defineFormPlugin({
  name: 'modal',
  onOptions(options) {
    if (!options.modal) {
      return
    }
    const modal = pick(defaultsDeep(options.modal, this.config.modal), KEYS)
    const close = modal.modalProps?.onBeforeClose
    const cancel = modal.modalProps?.onCancel
    modal.visible = false
    modal.modalProps ??= {}
    modal.modalSlots ??= {}
    modal.modalProps.onBeforeClose = () => (this.resetModel(), close?.())
    modal.modalProps.onCancel = () => ((this.state.modal!.visible = false), cancel?.())
    modal.modalProps.onBeforeOk = submit.bind(this)
    modal.modalSlots.default = this.renderFn.bind(this)
    this.setState({ modal })
  },
  onOptionsAfter() {
    if (!this.state.modal) {
      return
    }
    const items = this.state.items
    const index = items.findIndex(i => i.setter === 'submit')
    if (index > -1) {
      items.splice(index, 1)
    }
  },
  onComponent(component) {
    if (!this.state.modal) {
      return
    }
    component.render = render.bind(this)
  },
})
