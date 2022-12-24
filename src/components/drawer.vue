<script setup lang="ts">
import { useStore } from '../stores/index'
import { ref, reactive, toRaw } from 'vue'
import type { FormInstance } from 'element-plus'
import { uploadTabel } from '../api/upload'
import { defineEmits } from 'vue'

const store = useStore()
const tableData = Array()
const form = reactive(Array())
const tabelKey = ref(0)
const visibilityBinding = ref<boolean>(false)
const index = ref<number>(0)
const ruleFormRef = ref<FormInstance>()
const emit = defineEmits(['cancelDrawer'])

store.subtitles.forEach((item, index) => {
  if (index > 0) {
    tableData.push(item)
    form.push(toRaw({ ...item }))
  }
})

const change = (scope: any) => {
  visibilityBinding.value = true
  index.value = scope.$index
}
const closeDrawer = () => {
  visibilityBinding.value = false
}
const checkEndTime = (rule: any, value: number, callback: any) => {
  if (value <= form[index.value].start_time) {
    callback(new Error('终止时间不得小于起始时间'))
  } else if (
    index.value < form.length - 1 &&
    value > form[index.value + 1].start_time
  ) {
    callback(new Error('终止时间不得大于下一条字幕的起始时间'))
  } else {
    callback()
  }
}
const checkStartTime = (rule: any, value: number, callback: any) => {
  if (value < 0) {
    callback(new Error('起始时间不得小于零'))
  } else if (index.value > 0 && value < form[index.value - 1].end_time) {
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
      tableData[index.value] = reactive({ ...form[index.value] })
      // if (index.value === tableData.length - 1) {
      //   store.slider.max = tableData[index.value].end_time
      // }
      visibilityBinding.value = false
    } else {
    }
  })
  tabelKey.value++
}
const submitTabel = async () => {
  emit('cancelDrawer')
  const str = JSON.stringify(tableData)
  const { data } = await uploadTabel(str, {
    headers: {
      'Content-type': 'application/json'
    }
  })
  const blob = new Blob([data])
  const href = window.URL.createObjectURL(blob)
  const el = document.createElement('a')
  el.href = href
  el.style.display = 'none'
  el.download = 'newSubtitles'
  document.body.appendChild(el)
  el.click()
  document.body.removeChild(el)
  window.URL.revokeObjectURL(href)

  const file = new File([blob], 'subtitles')
  store.uploadFile(file, '更新')
}
</script>
<template>
  <el-table :data="tableData" :key="tabelKey" style="width: 100%" stripe border>
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
  <el-button type="primary" @click="submitTabel">提交并更新字幕文件</el-button>
  <el-button type="info" @click="$emit('cancelDrawer')">取消</el-button>
  <el-drawer
    v-model="visibilityBinding"
    title="修改"
    :append-to-body="true"
    :close-on-click-modal="true"
    :modal="false"
    size="33%"
    @closed="closeDrawer"
  >
    <el-divider></el-divider>
    <el-form
      :rules="rules"
      :model="form[index]"
      label-position="top"
      ref="ruleFormRef"
    >
      <el-form-item label="ID：">
        <el-input disabled v-model="form[index].id"></el-input>
      </el-form-item>
      <el-form-item label="开始时间(ms)：" prop="start_time">
        <el-input v-model.number="form[index].start_time"></el-input>
      </el-form-item>
      <el-form-item label="结束时间(ms)：" prop="end_time">
        <el-input v-model.number="form[index].end_time"></el-input>
      </el-form-item>
      <el-form-item label="字幕内容：" prop="content">
        <el-input v-model="form[index].content" autosize></el-input>
      </el-form-item>
      <el-divider></el-divider>
      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)"
          >确定</el-button
        >
      </el-form-item>
    </el-form>
  </el-drawer>
</template>
<style scoped lang="less"></style>
