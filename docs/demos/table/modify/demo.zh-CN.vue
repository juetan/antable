<template>
  <div>
    <UserTable></UserTable>
  </div>
</template>

<script lang="ts" setup>
import { useTable } from 'arconify'

const UserTable = useTable({
  data: params => {
    const { page, size, name } = params
    const data = Array.from({ length: size }, (_, index) => {
      const id = (page - 1) * size + index + 1
      return {
        id,
        name: `${name ?? '测试'}${id}`,
        gender: '男',
        description: '暂无描述',
      }
    })
    return {
      data,
      total: 200,
    }
  },
  columns: [
    {
      title: '名字',
      dataIndex: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '操作',
      type: 'button',
      buttons: [
        // 当定义 modify 属性时会默认添加，这里手动添加，允许你做自定义修改。
        // onClick 返回值将作为表单的 model。
        {
          text: '修改',
          type: 'modify',
          onClick(props) {
            const data = { ...props.record, name: 'todo' };
            return data;
          },
        },
        {
          text: '测试',
          onClick() {
            alert('我是表格行操作')
          },
        },
      ],
    },
  ],
  search: [
    {
      label: '用户名字',
      field: 'name',
      setter: 'search',
    },
  ],
  create: {
    items: [
      {
        label: '名字',
        field: 'name',
        setter: 'input',
      },
    ],
  },
  modify: {
    extend: true,
  },
})
</script>
