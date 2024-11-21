<template>
  <div class="main">
    <div class="head">
      <button @click="showColumn = !showColumn">隐藏</button>
    </div>
    <TestTable ref="ins">
      <template #test> 我是测试插槽 </template>
      <template #column:name="data: {}"> 测试 column {{ data }} </template>
      <template #table:pagination-left> table pagination-left </template>
    </TestTable>
    <FeForm></FeForm>
  </div>
</template>

<script setup lang="ts">
import '@arco-design/web-vue/dist/arco.min.css'
import { onMounted, ref } from 'vue'
import { useForm } from '../src/form'

const showColumn = ref(false)
const ins = ref(null)

const FeForm = useForm({
  // modal: {},
  items: [
    {
      field: 'todo',
      label: '测试',
    },
    {
      field: 'todo1',
      label: '测试',
      setter: 'password',
      visible: showColumn,
    },
  ],
  submit(model) {
    console.log(model)
  },
})

console.log(FeForm)

onMounted(() => {
  console.log(ins.value)
})

// console.time('dd')
// const TestTable = useTable({
//   config: {

//   },
//   data: async (params) => {
//     console.log('params: ', params);
//     await new Promise(res => setTimeout(res, 2000))
//     return [
//       {
//         id: 1,
//         name: 'todo'
//       }
//     ]
//   },
//   columns: [
//     {
//       title: '名字',
//       dataIndex: 'name1',
//       visible: () => showColumn.value,
//     },
//     {
//       title: '名字1',
//       dataIndex: 'name',
//     },
//   ],
//   search: [
//     {
//       field: 'todo',
//       label: '测试',
//       setter: 'input',
//     },
//     {
//       field: 'todo1',
//       label: '测试',
//       setter: 'password'
//     },
//     {
//       field: 'gender',
//       label: '性别',
//       setter: 'select',
//       required: true,
//       options: [
//         {
//           label: '男',
//           value: 1,
//         },
//         {
//           label: '女',
//           value: 0,
//         }
//       ]
//     },
//     {
//       field: 'gender1',
//       label: '性别',
//       setter: 'select',
//       required: true,
//       options: () => [
//         {
//           label: '男',
//           value: 1,
//         },
//         {
//           label: '女',
//           value: 0,
//         }
//       ]
//     },
//     {
//       field: 'gender2',
//       label: '性别',
//       setter: 'select',
//       required: true,
//       options: {
//         load: () => [
//           {
//             label: '男',
//             value: 1,
//           },
//           {
//             label: '女',
//             value: 0,
//           }
//         ],
//         loadOn: false
//       }
//     },

//   ],
//   create: {
//     items: [
//       {
//         field: 'todo',
//         label: '测试',
//         setter: 'input'
//       },
//       {
//         field: 'todo1',
//         label: '测试',
//         setter: 'password'
//       },
//     ]
//   },
//   update: {
//     items: [
//       {
//         field: 'todo',
//         label: '测试',
//         setter: 'input'
//       },
//       {
//         field: 'todo1',
//         label: '测试',
//         setter: 'password'
//       },
//     ]
//   },
//   toolbar: [
//     {
//       text: '测试1',
//       disable: showColumn,
//       onClick() {
//         TestTable.openUpdateModal()
//       }
//     },
//     {
//       text: '测试2',
//       disable: showColumn,
//       visible: () => showColumn.value,
//     },
//     {
//       text: '测试3',
//       disable: showColumn,
//     },
//     {
//       text: '测试4',
//       disable: showColumn,
//       visible: () => showColumn.value,
//     },
//     {
//       text: '测试5',
//       disable: showColumn,
//     },
//   ],

// })
// console.timeEnd('dd')
// console.log(TestTable)

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
