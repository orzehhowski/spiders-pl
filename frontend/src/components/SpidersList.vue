<script>
import SpiderCard from "./SpiderCard.vue";

export default {
  components: {
    SpiderCard,
  },
  props: {
    list: Array,
    isFamily: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<template>
  <div class="spiders-list">
    <div class="row row-cols-auto">
      <div v-for="spider of list" :key="spider.id" class="col">
        <SpiderCard :data="spider" :isFamily="this.isFamily"></SpiderCard>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.spider-card-link {
  text-decoration: none !important;

  .spider-card {
    width: 16rem;
    transition: transform 0.2s;

    img {
      height: 16rem;
      object-fit: cover;
    }
  }
}
.spider-card:hover {
  transform: scale(1.04);
}
</style>
