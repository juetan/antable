import { h } from 'vue'
import { useTable } from '../src'
import { IconMoreVertical } from '@arco-design/web-vue/es/icon'

export const TestTable = useTable({
  config: {
    clearSelectedOnChange: true,
  },
  async data(params) {
    console.log('params2: ', params)
    await new Promise(res => setTimeout(res, 1000))
    const lengths = Array(12).fill(0)
    return lengths.map((_, i) => ({ id: i + 1 + params.page, todo: 'todo' + params.page }))
  },
  columns: [
    {
      title: '名字',
      dataIndex: 'todo',
    },
    {
      title: '名字1',
      dataIndex: 'todo',
    },
    {
      title: '操作',
      align: 'right',
      width: 180,
      actions: [
        {
          text: '详情',
        },
        {
          text: '修改',
          disable: arg => arg.record.id === 6,
          confirm: '确定修改吗',
          onClick(data) {
            TestTable.openUpdateModal(data.record)
          },
        },
        {
          text: '删除',
          onDelete: true,
          async onClick(data) {
            await new Promise(res => setTimeout(res, 2000))
            console.log(data)
          },
        },
      ],
    },
  ],
  toolbar: [
    {
      text: '测试1',
      onClick() {
        TestTable.openUpdateModal()
      },
    },
    {
      text: '测试2',
      onSelect(rowKeys, rows) {
        console.log(rowKeys, rows)
      },
    },
    {
      icon: () => h(IconMoreVertical),
      sort: 76
    }
  ],
  items: [
    {
      field: 'todo',
      label: '测试',
      setter: 'input',
    },
    {
      field: 'todo1',
      label: '测试',
      setter: 'password',
    },
    {
      field: 'gender',
      label: '性别',
      setter: 'select',
      required: true,
      options: [
        {
          label: '男',
          value: 1,
        },
        {
          label: '女',
          value: 0,
        },
      ],
    },
    {
      field: 'gender1',
      label: '性别',
      setter: 'select',
      required: true,
      options: () => [
        {
          label: '男',
          value: 1,
        },
        {
          label: '女',
          value: 0,
        },
      ],
    },
    {
      field: 'gender2',
      label: '性别',
      setter: 'select',
      required: true,
      options: {
        load: () => [
          {
            label: '男',
            value: 1,
          },
          {
            label: '女',
            value: 0,
          },
        ],
        loadOn: false,
      },
    },
  ],
  search: [
    {
      field: 'todo',
    },
    {
      field: 'todo1',
    },
    {
      field: 'gender',
    },
    {
      field: 'gender1',
    },
  ],
  create: {
    items: [
      {
        field: 'todo',
      },
      {
        field: 'todo1',
      },
    ],
    submit(model) {
      console.log(model)
    },
  },
  update: {
    items: [
      {
        field: 'todo',
      },
      {
        field: 'todo1',
      },
    ],
    submit(model) {
      console.log(model)
    },
  },
})
