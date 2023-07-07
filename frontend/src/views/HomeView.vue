<script>
import SpidersList from "../components/SpidersList.vue";
import ErrorMessage from "../components/ErrorMessage.vue";
import LoadingMessage from "../components/LoadingMessage.vue";

export default {
  components: {
    SpidersList,
    ErrorMessage,
    LoadingMessage,
  },
  data() {
    return {
      families: [],
      message: null,
      resStatus: null,
    };
  },

  async mounted() {
    try {
      let res = await fetch(`${this.$API_URL}/family`);
      this.resStatus = res.status;
      res = await res.json();
      this.message = res.message;
      this.families = res.families;
    } catch {
      this.resStatus = 500;
    }
  },
};
</script>

<template>
  <main v-if="resStatus === 200" class="container">
    <h1 class="mt-3">Rodziny</h1>
    <hr />
    <SpidersList :list="families" :isFamily="true" />
  </main>
  <ErrorMessage v-else-if="resStatus" :status="resStatus" :message="message" />
  <LoadingMessage v-else />
</template>
