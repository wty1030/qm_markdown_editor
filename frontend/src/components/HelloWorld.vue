<script setup>
import {reactive} from 'vue'
import {Greet} from '../../wailsjs/go/main/App'

const data = reactive({
  name: "",
  resultText: "Please enter your name below 👇",
})

function greet() {
  Greet(data.name).then(result => {
    data.resultText = result
  })
}

</script>

<template>
  <main>
    <div id="result" class="result">{{ data.resultText }}</div>
    <div id="input" class="input-box">
      <input id="name" v-model="data.name" autocomplete="off" class="input" type="text"/>
      <button class="btn" @click="greet">Greet</button>
    </div>
  </main>
</template>

<style scoped>
.result {
  height: 20px;
  line-height: 20px;
  margin: 1.5rem auto;
  color: var(--text-primary);
}

.input-box .btn {
  width: 60px;
  height: 30px;
  line-height: 30px;
  border-radius: 3px;
  border: none;
  margin: 0 0 0 20px;
  padding: 0 8px;
  cursor: pointer;
  background-color: var(--btn-bg);
  color: var(--btn-text);
}

.input-box .btn:hover {
  background-color: var(--btn-bg-hover);
}

.input-box .input {
  border: 1px solid var(--border-color);
  border-radius: 3px;
  outline: none;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

.input-box .input:hover {
  border-color: var(--accent-color);
}

.input-box .input:focus {
  border-color: var(--accent-color);
}
</style>
