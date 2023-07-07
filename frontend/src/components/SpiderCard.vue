<script>
import { RouterLink } from "vue-router";
export default {
  components: {
    RouterLink,
  },
  props: {
    data: Object,
    isFamily: Boolean,
  },
  computed: {
    familyLink() {
      const type = this.isFamily ? "family" : "spider";
      return `/${type}/${this.data.id}`;
    },
    imageSrc() {
      let src;
      if (this.isFamily) {
        src = this.data.image.src;
      } else {
        src = this.data.images[0].src;
      }
      return `${this.$API_URL}/${src}`;
    },
    authorName() {
      if (this.isFamily) {
        return this.data.imageAuthor;
      } else {
        return this.data.images[0].author;
      }
    },
  },
};
</script>

<template>
  <RouterLink :to="familyLink" class="spider-card-link text-dark">
    <div class="card spider-card my-2">
      <img
        :src="imageSrc"
        class="card-img-top"
        :alt="`author: ${authorName}`"
      />
      <div class="card-body">
        <div v-if="this.data.name">
          <h5 class="card-title">{{ this.data.name }}</h5>
          <p class="card-text italic">{{ this.data.latinName }}</p>
        </div>
        <div v-else>
          <h5 class="card-title italic">{{ this.data.latinName }}</h5>
          <p></p>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
