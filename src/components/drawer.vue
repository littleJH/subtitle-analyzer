<script setup lang="ts">
import { useStore } from '../stores/index'
import { ref, reactive, toRaw } from 'vue'
import { FormInstance, ElNotification } from 'element-plus'
import { uploadTabel } from '../api/upload'
import { defineEmits } from 'vue'

const store = useStore()
const visibilityBinding = ref<boolean>(false)
const index = ref<number>(0)
let form: any
let preForm: any
let nextForm: any
const ruleFormRef = ref<FormInstance>()
const delay = ref<number>(0)
let blob: Blob

const emit = defineEmits(['cancelDrawer'])
const change = (scope: any) => {
  visibilityBinding.value = true
  index.value = scope.$index
  form = reactive(toRaw({ ...store.subtitles[index.value] }))
  preForm = toRaw({ ...store.subtitles[index.value - 1] })
  nextForm = toRaw({ ...store.subtitles[index.value + 1] })
}
const closeDrawer = () => {
  visibilityBinding.value = false
}
const checkEndTime = (rule: any, value: number, callback: any) => {
  if (value <= form.start_time) {
    callback(new Error('终止时间不得小于起始时间'))
  } else if (
    index.value < store.subtitles.length - 1 &&
    value > nextForm.start_time
  ) {
    callback(new Error('终止时间不得大于下一条字幕的起始时间'))
  } else {
    callback()
  }
}
const checkStartTime = (rule: any, value: number, callback: any) => {
  if (value < 0) {
    callback(new Error('起始时间不得小于零'))
  } else if (index.value > 0 && value < preForm.end_time) {
    callback(new Error('起始时间不得小于上一条字幕的终止时间'))
  } else {
    callback()
  }
}
const checkContent = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('字幕内容不得为空'))
  } else {
    callback()
  }
}
const rules = reactive({
  start_time: [
    {
      validator: checkStartTime,
      trigger: 'blur'
    }
  ],
  end_time: [
    {
      validator: checkEndTime,
      trigger: 'blur'
    }
  ],
  content: [
    {
      validator: checkContent,
      trigger: 'blur'
    }
  ]
})

const submitForm = (formEL: FormInstance | undefined) => {
  formEL?.validate(valid => {
    if (valid) {
      store.subtitles[index.value] = reactive({ ...form })
      // if (index.value === tableData.length - 1) {
      //   store.slider.max = tableData[index.value].end_time
      // }
      visibilityBinding.value = false
    } else {
    }
  })
}
const submitTabel = async () => {
  emit('cancelDrawer')
  if (blob) {
    const str = JSON.stringify(store.subtitles)
    const { data } = await uploadTabel(str, {
      headers: {
        'Content-type': 'application/json'
      }
    })
    blob = new Blob([data])
  }

  const file = new File([blob], 'subtitles')
  store.uploadFile(file, '更新')
}
const downloadFile = async () => {
  if (!blob) {
    emit('cancelDrawer')
    const str = JSON.stringify(store.subtitles)
    const { data } = await uploadTabel(str, {
      headers: {
        'Content-type': 'application/json'
      }
    })
    blob = new Blob([data])
  }
  const href = window.URL.createObjectURL(blob)
  const el = document.createElement('a')
  el.href = href
  el.style.display = 'none'
  el.download = 'newSubtitles'
  document.body.appendChild(el)
  el.click()
  document.body.removeChild(el)
  window.URL.revokeObjectURL(href)
}
const add = () => {
  delay.value += 1000
  inputChange(1000)
}
const sub = () => {
  delay.value -= 1000
  inputChange(-1000)
}
const inputChange = (value: number | string) => {
  const val = Number(value)
  if (store.subtitles[0].start_time < -delay.value) {
    ElNotification({
      type: 'warning',
      message: '该推移量导致首条字幕的起始时间小于零，请重新设置',
      duration: 3000,
      position: 'top-left'
    })
  } else {
    store.subtitles.forEach(item => {
      item.start_time += val
      item.end_time += val
    })
    store.slider.max += val
  }
}
</script>
<template>
  <h4>字幕整体推移</h4>
  <el-input
    v-model="delay"
    input-style="width: auto; text-align: center"
    @change="inputChange"
  >
    <template #prepend>
      <el-button type="info" @click="sub">-</el-button>
    </template>
    <template #append>
      <el-button type="info" @click="add">+</el-button>
    </template>
  </el-input>
  <el-divider></el-divider>
  <h4>修改字幕内容</h4>
  <el-table :data="store.subtitles" style="width: 100%" stripe border>
    <el-table-column prop="id" label="ID" width="100"></el-table-column>
    <el-table-column
      prop="start_time"
      label="开始时间"
      width="100"
    ></el-table-column>
    <el-table-column
      prop="end_time"
      label="结束时间"
      width="100"
    ></el-table-column>
    <el-table-column prop="content" label="内容"></el-table-column>
    <el-table-column fixed="right" label="操作" width="80">
      <template #default="scope">
        <el-button
          link
          type="primary"
          size="small"
          @click.prevent="change(scope)"
          >change</el-button
        >
      </template>
    </el-table-column>
  </el-table>
  <el-divider></el-divider>
  <el-button type="primary" @click="submitTabel">更新字幕文件</el-button>
  <el-button type="primary" @click="downloadFile">下载字幕文件</el-button>
  <el-button type="info" @click="$emit('cancelDrawer')">取消</el-button>
  <el-drawer
    v-model="visibilityBinding"
    title="修改"
    :append-to-body="true"
    :close-on-click-modal="true"
    :modal="false"
    size="25%"
    @closed="closeDrawer"
  >
    <el-divider></el-divider>
    <el-form
      :rules="rules"
      :model="form"
      label-position="top"
      ref="ruleFormRef"
    >
      <el-form-item label="ID：">
        <el-input disabled v-model="form.id"></el-input>
      </el-form-item>
      <el-form-item label="开始时间(ms)：" prop="start_time">
        <el-input v-model.number="form.start_time"></el-input>
      </el-form-item>
      <el-form-item label="结束时间(ms)：" prop="end_time">
        <el-input v-model.number="form.end_time"></el-input>
      </el-form-item>
      <el-form-item label="字幕内容：" prop="content">
        <el-input v-model="form.content" autosize></el-input>
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)"
          >确定</el-button
        ><el-button type="info" @click="closeDrawer">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>
<style scoped lang="less"></style>
