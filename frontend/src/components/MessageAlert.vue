<script>
export default {
  props: {
    messages: Array,
  },
  methods: {
    closeAlert(index) {
      this.$refs.alerts[index].classList.add("hidden");
    },
  },
};
</script>

<template>
  <div class="container">
    <div
      ref="alerts"
      v-for="(message, index) in messages"
      :class="`alert alert-${message.type} mt-3 p-3`"
      :key="index"
      role="alert"
    >
      <p class="my-auto">
        {{ message.message }}
      </p>
      <i class="close-icon fa-solid fa-xmark" @click="closeAlert(index)"></i>
    </div>
  </div>
</template>

<style>
.alert {
  padding: 0.9rem;
}
.close-icon {
  font-size: 1.2rem;
  margin: auto 0;
  padding: 4px;
  cursor: pointer;
}
@media only screen and (min-width: 768px) {
  .alert {
    max-width: 36rem;
    display: flex;
    justify-content: space-between;
  }
}
</style>
