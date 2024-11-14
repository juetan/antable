import { Button, Modal } from '@arco-design/web-vue'
import { defaultsDeep } from 'lodash-es'
import type { AnFormState } from './form'
import { AnForm, defineFormPlugin } from './form'

declare module './form' {
  interface AnFormModalTrigger {
    render?: (arg: any) => any
  }
  interface UseFormModal {
    title?: string
    width?: number | string
    trigger?: AnFormModalTrigger | boolean
    modalProps?: InstanceType<typeof Modal>['$props'] & {}
    modalSlots?: {
      default?: any
      title?: any
      footer?: any
    }
  }
  interface AnForm {
    openModal(): void
  }
  interface UseFormOptions {
    modal?: UseFormModal
  }
  interface AnFormState {
    modal: UseFormModal
  }
  interface AnFormConfig {
    modal: UseFormModal
  }
}

AnForm.prototype.openModal = function () {
  const props = this.state.modal.modalProps
  if (props) {
    props.visible = true
  }
}

export default defineFormPlugin({
  name: 'modal',
  onOptions(options) {
    if (!options.modal) {
      return
    }

    const modal = defaultsDeep(
      options.modal ?? {},
      {
        modalProps: {
          onBeforeClose: () => this.resetModel(),
          onBeforeOk: (done: any) => done(true),
        },
        modalSlots: {
          default: this.render.bind(this),
        },
      },
      options.config!.modal,
    )

    const Trigger = () => {
      const item = this.state.modal.trigger!
      if (!item) {
        return null
      }
      return (
        <Button type="primary" onClick={() => this.openModal()}>
          打开
        </Button>
      )
    }

    function MoDal(state: AnFormState) {
      console.log('render modal1')
      const { modalProps, modalSlots, title, width } = state.modal
      return (
        <Modal
          {...modalProps}
          v-model:visible={modalProps!.visible}
          title={title}
          width={width}
        >
          {{ ...modalSlots }}
        </Modal>
      )
    }

    const render = () => (
      <>
        <Trigger></Trigger>
        <MoDal {...this.state} />
      </>
    )

    this.state.formProps.layout ??= 'vertical'
    this.render = render
    this.setState({ modal } as any)
  },
})
