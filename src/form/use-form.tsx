import { AnForm, UseFormOptions } from './form'
import formPlugin from './plugin-form'
import formModalPlugin from './plugin-modal'
import formModelPlugin from './plugin-model'
import setterCascader from './setter-cascader'
import setterDate from './setter-date'
import setterDateRange from './setter-date-range'
import setterInput from './setter-input'
import setterNumber from './setter-number'
import setterPassword from './setter-password'
import setterSearch from './setter-search'
import setterSelect from './setter-select'
import setterSubmit from './setter-submit'
import setterTextarea from './setter-textarea'
import setterTime from './setter-time'
import setterTreeSelect from './setter-tree-select'

export function useForm(options: UseFormOptions | ((form: AnForm) => UseFormOptions)) {
  return new AnForm(options)
}

AnForm.setConfig({
  name: 'AnForm',
  validateBeforeSubmit: true,
  loadingOnSubmit: true,
  plugins: [
    formPlugin,
    formModelPlugin,
    formModalPlugin,
    setterInput,
    setterNumber,
    setterPassword,
    setterSearch,
    setterTextarea,
    setterSelect,
    setterTreeSelect,
    setterCascader,
    setterTime,
    setterDate,
    setterDateRange,
    setterSubmit,
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
  modal: {
    title: '操作',
    width: 480,
    modalSlots: {},
    modalProps: {
      key: 'qunickey',
      titleAlign: 'start',
      closable: false,
      unmountOnClose: true,
      maskClosable: false,
    },
  },
  cascader: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
      expandTrigger: 'hover',
    },
  },
  dateRange: {
    setterProps: {
      allowClear: true,
      style: {
        width: '100%',
      },
    },
  },
  date: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
      style: {
        width: '100%',
      },
    },
  },
  input: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
    },
  },
  number: {
    placeholder: '请输入',
    setterProps: {
      defaultValue: 0,
      allowClear: true,
    },
  },
  password: {
    placeholder: '请输入',
  },
  search: {
    placeholder: '请输入',
  },
  select: {
    placeholder: '请选择',
    setterProps: {
      allowClear: true,
    },
  },
  selectOpt: {
    loadOn: 'mounted',
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
  },
  textarea: {
    placeholder: '请输入',
  },
  time: {
    placeholder: '请输入',
    setterProps: {
      allowClear: true,
      style: {
        width: '100%',
      },
    },
  },
  treeSelect: {
    placeholder: '请输入',
  },
})
