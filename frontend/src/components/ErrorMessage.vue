<script>
export default {
  props: {
    status: {
      type: Number,
      required: true,
    },
    message: String,
  },
};
</script>

<template>
  <main class="container">
    <h1 class="mt-3">Ups! coś poszło nie tak!</h1>
    <h2 class="mt-2">
      Kod błędu: {{ status
      }}<span v-if="message">, wiadomość: "{{ message }}"</span>
    </h2>
  </main>
</template>
