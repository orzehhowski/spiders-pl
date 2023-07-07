<script>
import SpiderDescription from "../components/SpiderDescription.vue";
import SourcesList from "../components/SourcesList.vue";
import ErrorMessage from "../components/ErrorMessage.vue";
import LoadingMessage from "../components/LoadingMessage.vue";
import BsCarousel from "../components/BsCarousel.vue";

export default {
  components: {
    SpiderDescription,
    SourcesList,
    ErrorMessage,
    LoadingMessage,
    BsCarousel,
  },
  data() {
    return {
      id: Number,
      images: Array,
      appearanceDesc: String,
      behaviorDesc: String,
      sources: Array,
      polishName: String,
      latinName: String,
      resStatus: null,
      message: null,
    };
  },
  async mounted() {
    try {
      const res = await fetch(
        `${this.$API_URL}/spider/${this.$route.params.id}`
      );
      const resJson = await res.json();

      this.message = resJson.message;
      this.id = resJson.id;
      this.images = resJson.images;
      this.polishName = resJson.name;
      this.latinName = resJson.latinName;
      this.appearanceDesc = resJson.appearanceDesc;
      this.behaviorDesc = resJson.behaviorDesc;
      this.sources = resJson.sources;
      this.resStatus = res.status;
    } catch {
      this.resStatus = 500;
    }
  },
};
</script>

<template>
  <main v-if="resStatus === 200" class="container">
    <h1 :class="`mt-3` + (polishName ? `` : ` italic`)">
      {{ polishName || latinName }}
    </h1>
    <h2 v-if="polishName" class="italic">{{ latinName }}</h2>
    <hr />
    <BsCarousel :images="images" />
    <SpiderDescription
      :desc="appearanceDesc"
      :isFamily="false"
      :id="id"
      title="Wygląd"
    />
    <SpiderDescription
      :desc="behaviorDesc"
      :isFamily="false"
      :id="id"
      title="Tryb życia"
    />
    <SourcesList :sources="sources" />
  </main>

  <ErrorMessage v-else-if="resStatus" :status="resStatus" :message="message" />
  <LoadingMessage v-else />
</template>
