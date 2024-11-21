import { Button, Modal } from '@arco-design/web-vue'
import { defaultsDeep, pick } from 'lodash-es'
import type { AnFormModal as render } from './form'
import { AnForm, defineFormPlugin } from './form'
import { Recordable } from '../core'

declare module './form' {
  type BaseModalProps = InstanceType<typeof Modal>['$props']
  type BaseModalSlots = { default?: any; title?: any; footer?: any }

  interface AnFormModalTrigger {
    render?: (arg: any) => any
  }
  interface UseFormModalBase {
    title?: string
    width?: number | string
  }
  interface UseFormModal extends UseFormModalBase {
    trigger?: AnFormModalTrigger | boolean
    modalProps?: BaseModalProps
    modalSlots?: BaseModalSlots
  }
  interface AnFormModal extends UseFormModalBase {
    trigger?: () => any
    visible: boolean
    modalProps: BaseModalProps
    modalSlots: BaseModalSlots
  }

  interface AnForm {
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
  const modal = this.state.modal!
  return (
    <>
      {modal.trigger?.()}
      <Modal {...modal.modalProps} v-model:visible={modal.visible} title={modal.title} width={modal.width}>
        {{ ...modal.modalSlots }}
      </Modal>
    </>
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

function resolveTrigger(this: AnForm) {
  const open = this.openModal.bind(this)
  return () => (
    <Button type="primary" onClick={open}>
      打开
    </Button>
  )
}

export default defineFormPlugin({
  name: 'modal',
  onOptions(options) {
    if (!options.modal) {
      return
    }
    let modal = defaultsDeep(options.modal, this.config.modal)
    modal = pick(options.modal, KEYS)
    modal.visible = false
    modal.modalProps ??= {}
    modal.modalSlots ??= {}
    modal.modalProps.onBeforeClose = () => this.resetModel()
    modal.modalProps.onCancel = () => (this.state.modal!.visible = false)
    modal.modalProps.onBeforeOk = submit.bind(this)
    modal.modalSlots.default = this.render.bind(this)
    modal.trigger = resolveTrigger.call(this)
    this.setState({ modal } as any)
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
  }
})
