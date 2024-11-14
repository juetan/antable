import { AnForm, UseFormOptions } from './form'
import formPlugin from './plugin-form'
import formModalPlugin from './plugin-modal'
import formModelPlugin from './plugin-model'
import formCascaderPlugin from './setter-cascader'
import formDatePlugin from './setter-date'
import formDateRangePlugin from './setter-date-range'
import formInputPlugin from './setter-input'
import formNumberPlugin from './setter-number'
import formPasswordPlugin from './setter-password'
import formSearchPlugin from './setter-search'
import formSelectPlugin from './setter-select'
import formSubmitPlugin from './setter-submit'
import formTextareaPlugin from './setter-textarea'
import formTimePlugin from './setter-time'
import formTreeSelectPlugin from './setter-tree-select'

AnForm.setConfig({
  name: 'AnForm',
  plugins: [
    formPlugin,
    formModelPlugin,
    formModalPlugin,
    formInputPlugin,
    formNumberPlugin,
    formPasswordPlugin,
    formSearchPlugin,
    formTextareaPlugin,
    formSelectPlugin,
    formTreeSelectPlugin,
    formCascaderPlugin,
    formTimePlugin,
    formDatePlugin,
    formDateRangePlugin,
    formSubmitPlugin,
  ],
  formProps: {
    layout: 'vertical',
  },
  item: {
    itemProps: {},
    itemSlots: {},
  },
  model: {
    id: undefined,
  },
  rules: {},
  modal: {
    title: '操作',
    width: 600,
    modalSlots: {},
    modalProps: {
      key: 'qunickey',
      titleAlign: 'start',
      closable: false,
      unmountOnClose: true,
      maskClosable: false,
      visible: false,
    },
  },
  cascader: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
      expandTrigger: 'hover',
    },
    itemSlots: {},
  },
  dateRange: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
    },
    itemSlots: {},
  },
  date: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
    },
    itemSlots: {},
  },
  input: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
    },
    itemSlots: {},
  },
  number: {
    setterProps: {
      defaultValue: 0,
      allowClear: true,
    },
    itemSlots: {},
  },
  password: {
    placeholder: '请输入',
    itemSlots: {},
  },
  search: {
    placeholder: '请输入',
    itemSlots: {},
  },
  select: {
    placeholder: '请选择',
    setterProps: {
      allowClear: true,
    },
    itemSlots: {},
  },
  selectOpt: {
    loadOn: 'mounted',
    loader: null,
  },
  submit: {
    placeholder: '请输入',
    setterProps: {
      submitText: '提交',
      resetText: '重置',
    },
    itemProps: {
      hideLabel: true,
    },
    itemSlots: {},
  },
  textarea: {
    placeholder: '请输入',
    itemSlots: {},
  },
  time: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
    },
    itemSlots: {},
  },
  treeSelect: {
    placeholder: '请输入',
    itemSlots: {},
  },
})

export function useForm(options: UseFormOptions | ((form: AnForm) => UseFormOptions)) {
  const form = new AnForm(options)
  const component = Object.create(form) as AnForm
  ;(component as any).callParal('onComponent', component)
  return component
}
