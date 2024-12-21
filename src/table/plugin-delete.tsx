import { Modal } from '@arco-design/web-vue'
import { defineTablePlugin } from './table'

declare module './table' {
  interface AnTableColumnActionBase {
    onDelete?: boolean
  }
}

export default defineTablePlugin({
  name: 'delete',
  onOptionsColumnAfter(column) {
    if (!column.actions) {
      return
    }
    const action = column.actions.find(i => i.onDelete)
    if (!action) {
      return
    }
    const click = action.onClick
    action.onClick = async arg => {
      Modal.open({
        title: '提示',
        content: '确定删除吗?',
        titleAlign: 'start',
        width: 360,
        closable: false,
        maskClosable: false,
        okButtonProps: {
          status: 'danger',
        },
        onOk() {
          click?.(arg)
        },
      })
    }
  },
})
