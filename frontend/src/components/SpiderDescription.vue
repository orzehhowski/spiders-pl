<script>
export default {
  props: {
    title: String,
    desc: String,
    isFamily: Boolean,
    id: Number,
  },
  data() {
    return {
      chunks: Array,
      isAuth: Boolean,
      isAdmin: Boolean,
      isEdited: false,
      newDesc: this.desc,
    };
  },
  mounted() {
    if (this.desc) {
      const chunks = this.desc.split("===");
      const chunkObjects = [];
      let iterator = 0;
      for (let chunk of chunks) {
        if (chunk.trim()) {
          chunkObjects.push({ text: chunk, isTitle: iterator % 2 });
        }
        iterator++;
      }

      this.chunks = chunkObjects;
    }
    this.isAuth = localStorage.getItem("isAuth") === "true";
    this.isAdmin = localStorage.getItem("isAdmin") === "true";
  },

  methods: {
    switchEdit() {
      this.isEdited = !this.isEdited;
      this.$refs.article.classList.toggle("hidden");
      this.$refs.form.classList.toggle("hidden");
    },

    async onSubmit(ev) {
      ev.preventDefault();
      if (this.isAuth) {
        const reqBody = {};
        if (this.title === "Wygląd") {
          reqBody.appearanceDesc = this.newDesc;
        } else if (this.title === "Tryb życia") {
          reqBody.behaviorDesc = this.newDesc;
        } else {
          return;
        }
        const res = await fetch(
          `${this.$API_URL}/${this.isFamily ? "family" : "spider"}/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(reqBody),
          }
        );

        // Set message
        let message;
        let type;
        if (this.isAdmin) {
          if (res.status === 200) {
            message = "Zmiana zapisana.";
            type = "info";
          } else {
            message = `Wystąpił błąd nr ${res.status}: ${await res.json()
              .message}`;
            type = "danger";
          }
        } else {
          if (res.status === 200) {
            message = "Wysłano sugestię zmiany.";
            type = "info";
          } else {
            message = `Wystąpił błąd nr ${res.status}: ${await res.json()
              .message}`;
            type = "danger";
          }
        }

        localStorage.setItem(
          "message",
          JSON.stringify({
            message,
            type,
          })
        );
        location.reload();
      }
    },
  },
};
</script>

<template>
  <div v-if="desc">
    <div class="title-container">
      <h4 class="mt-4 mb-0">{{ title }}</h4>
      <i
        :class="`edit-icon fa-solid fa-pen p-2 mt-3 ${isAuth || 'disabled'}`"
        @click="isAuth && switchEdit()"
      ></i>
    </div>
    <hr class="small" />
    <article class="desc" ref="article">
      <div v-for="(chunk, index) in chunks" :key="index">
        <h6 v-if="chunk.isTitle">{{ chunk.text }}</h6>
        <p v-else>{{ chunk.text }}</p>
      </div>
    </article>
    <form class="edit-desc-form hidden" ref="form" @submit="onSubmit">
      <label for="desc" class="mb-2 form-label">
        Za pomocą składni <code>=== podtutuł ===</code> możesz dodawać
        podtytuły.
      </label>
      <textarea
        v-model="newDesc"
        class="edit-desc-input form-control"
        ref="input"
      ></textarea>
      <button type="submit" class="btn btn-primary mt-2">Zatwierdź</button>
    </form>
  </div>
</template>

<style lang="scss">
.desc {
  text-align: justify;
}

.edit-desc-form {
  width: 100%;

  .edit-desc-input {
    width: 100%;
    height: 18rem;
    overflow-y: scroll;
  }
}
</style>
