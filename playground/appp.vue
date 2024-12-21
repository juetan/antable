<template>
  <div class="main">
    <div class="head">
      <button @click="showColumn = !showColumn">隐藏</button>
    </div>
    <!-- <FeForm></FeForm> -->
    <TestTable ref="ins">
      <template #test> 我是测试插槽 </template>
      <template #column:name="data: {}"> 测试 column {{ data }} </template>
      <template #table:pagination-left> table pagination-left </template>
    </TestTable>
  </div>
</template>

<script setup lang="tsx">
import '@arco-design/web-vue/dist/arco.min.css'
import { onMounted, ref } from 'vue'
import { useForm } from '../src'
import { TestTable } from './table';

const showColumn = ref(false)
const ins = ref(null)

const FeForm = useForm({
  formProps: {
    // layout: 'horizontal',
    // autoLabelWidth: true,
    // labelAlign: 'left',
    style: {
      width: '286px',
    },
  },
  model: {
    inner: {
      name: 'todo'
    }
  },
  items: [
    {
      field: 'inner.name',
      label: '输入框',
      setter: 'input',
    },
    {
      field: 'password',
      label: '密码框',
      setter: 'password',
    },
    {
      field: 'search',
      label: '搜索框',
      setter: 'search',
    },
    {
      field: 'textarea',
      label: '文本框',
      setter: 'textarea',
    },
    {
      field: 'mediaType1',
      label: '日期框',
      setter: 'date',
    },
    {
      field: 'mediaType2',
      label: '时间框',
      setter: 'time',
    },
    {
      field: '[start,end]',
      label: '日期范围框',
      setter: 'dateRange',
    },
    {
      field: 'cascader',
      label: '时间框',
      setter: 'cascader',
    },
    {
      field: 'number',
      label: '数字框',
      setter: 'number',
    },
    {
      field: 'select',
      label: '选择框',
      setter: 'select',
      options: [
        {
          label: '视频',
          value: 1,
        },
        {
          label: '图片',
          value: 2,
        },
      ],
    },
    {
      field: 'todo1',
      label: '测试',
      setter: 'select',
      // visible: showColumn,
      options() {
        return [
          {
            label: '青',
            value: 1,
          },
          {
            label: '白',
            value: 2,
          },
        ]
      },
    },
    {
      field: 'todo12',
      label: '测试1',
      setter: 'select',
      // visible: showColumn,
      options: {
        load() {
          return [
            {
              label: '青',
              value: 1,
            },
            {
              label: '白',
              value: 2,
            },
          ]
        },
        loadOn: false,
      },
    },
  ],
  async submit(model) {
    await new Promise(res => setTimeout(res, 3000))
    console.log(model)
  },
})

console.log(FeForm)

onMounted(() => {
  console.log(ins.value)
})

console.time('dd')

console.timeEnd('dd')
console.log(TestTable)

// setTimeout(() => {
//   TestTable.setData([
//     {
//       id: 1,
//       name: 'c'
//     },
//     {
//       id: 2,
//       name: 'bc'
//     }
//   ])
// }, 3000);
</script>

<style scoped>
.main {
  max-width: 1480px;
  margin: 0 auto;
}

.head {
  background: #ececec;
  padding: 12px 16px;
  margin: 12px 0 16px;
  border-radius: 4px;
}
</style>
