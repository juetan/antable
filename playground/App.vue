<template>
  <div style="width: 1280px; margin: 20px auto">
    <div style="margin-bottom: 16px; display: flex; gap: 8px">
      <Button @click="showTest = !showTest">显示测试</Button>
      <Button @click="showCreate = !showCreate">显示新增</Button>
      <Button @click="showPaging = !showPaging">显示分页</Button>
      <Button @click="showDelete = !showDelete">显示删除</Button>
      <Button @click="showModify = !showModify">显示修改</Button>
      <Button @click="showSearch = !showSearch">显示搜索</Button>
    </div>
    <DemoTable></DemoTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTable } from '../src'
import { Button } from '@arco-design/web-vue'

const showTest = ref(true)
const showCreate = ref(true)
const showPaging = ref(true)
const showDelete = ref(true)
const showModify = ref(true)
const showSearch = ref(true)

const getOptions = async (ms = 8000) => {
  await new Promise(resolve => setTimeout(resolve, ms))
  return [
    { label: '选项1', value: 1 },
    { label: '选项2', value: 2 },
  ]
}

const DemoTable = useTable({
  name: 'DemoTable',
  async data() {
    await new Promise(res => setTimeout(res, 2000))
    return {
      total: 200,
      data: [
        {
          id: 1,
          name: '测试',
        },
        {
          id: 2,
          name: '测试',
        },
        {
          id: 3,
          name: '测试',
        },
      ],
    }
  },
  columns: [
    {
      title: '测试',
      dataIndex: 'name',
    },
  ],
  paging: {
    visible: showPaging,
  },
  search: {
    items: [
      {
        label: '类型',
        field: 'type',
        setter: 'select',
        options: () => getOptions(),
      },
      {
        label: '名称',
        field: 'name',
        setter: 'search',
        disable: showTest,
      },
    ],
  },
  toolbar: [
    {
      // action: 'create',
      visible: showCreate,
    },
    {
      text: '测试',
      visible: showTest,
    },
    {
      text: '删除',
      // action: 'delete',
      visible: showDelete,
      // async onClick(rowKeys, rows) {
      //   await new Promise(res => setTimeout(res, 3000))
      //   console.log(rowKeys, rows)
      // },
    },
  ],
  create: {
    items: [
      {
        label: '名称',
        field: 'name',
      },
      {
        label: '类型',
        field: 'type',
        setter: 'select',
        options: () => getOptions(),
      },
    ],
    submit: () => {},
  },
  tableProps: {
    bordered: true,
  },
  tableSlots: {},
})

console.log(DemoTable)
</script>

<style scoped></style>
