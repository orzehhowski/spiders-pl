<script>
export default {
  props: {
    images: Array,
  },
};
</script>

<template>
  <h4>Galeria</h4>
  <div id="galleryCarousel" class="carousel slide">
    <div class="carousel-indicators">
      <button
        v-for="(image, index) in images"
        :key="image.id"
        :class="index === 0 && `active`"
        type="button"
        data-bs-target="#galleryCarousel"
        :data-bs-slide-to="index"
        aria-current="true"
        :aria-label="`Slide ${index + 1}`"
      ></button>
    </div>
    <div class="carousel-inner">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        :class="`carousel-item ${index === 0 ? 'active' : ''}`"
      >
        <img
          :src="`${$API_URL}/${image.src}`"
          class="d-block w-100"
          :alt="image.author"
        />
      </div>
    </div>
    <button
      class="carousel-control-prev"
      type="button"
      data-bs-target="#galleryCarousel"
      data-bs-slide="prev"
    >
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Poprzedni</span>
    </button>
    <button
      class="carousel-control-next"
      type="button"
      data-bs-target="#galleryCarousel"
      data-bs-slide="next"
    >
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Następny</span>
    </button>
  </div>
</template>
