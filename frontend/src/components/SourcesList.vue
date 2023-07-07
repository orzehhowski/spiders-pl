<script>
export default {
  props: {
    sources: Array,
    isFamily: Boolean,
    id: Number,
  },
  data() {
    return {
      isAuth: Boolean,
      isAdmin: Boolean,
      isEdited: false,
      newSources: this.sources,
    };
  },
  mounted() {
    this.isAuth = localStorage.getItem("isAuth") === "true";
    this.isAdmin = localStorage.getItem("isAdmin") === "true";
  },
  methods: {
    switchEdit() {
      this.isEdited = !this.isEdited;
      this.$refs.list.classList.toggle("hidden");
      this.$refs.form.classList.toggle("hidden");
    },
    async onTrashClick(ev) {
      const sourceContainer = ev.target.closest(".edit-source-container");
      console.log(sourceContainer);
    },
    async onSubmit(ev) {
      ev.preventDefault();
      if (this.isAuth) {
        const res = await fetch(
          `${this.$API_URL}/${this.isFamily ? "family" : "spider"}/${this.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ sources: this.newSources }),
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
  <div v-if="sources.length > 0">
    <div class="title-container">
      <h4 class="mt-4 mb-0">Źródła zewnętrzne</h4>
      <i
        :class="`edit-icon fa-solid fa-pen p-2 mt-3 ${isAuth || 'disabled'}`"
        @click="isAuth && switchEdit()"
      ></i>
    </div>
    <hr class="small" />
    <div class="mb-4" ref="list">
      <p v-for="(source, index) in sources" :key="index" class="sources">
        <a :href="source" target="_blank" rel="noopener">{{ source }}</a>
      </p>
    </div>

    <form class="edit-sources-form hidden" ref="form" @submit="onSubmit">
      <div
        class="edit-source-container my-3"
        v-for="(source, index) in sources"
        :key="index"
      >
        <a :href="source" target="_blank" rel="noopener">{{ source }}</a>
        <i class="edit-icon fa-solid fa-trash p-2" @click="onTrashClick"></i>
      </div>
      <div class="edit-source-container my-3">
        <input type="url" class="form-control" />
        <i class="edit-icon fa-solid fa-plus p-2"></i>
      </div>
      <button type="submit" class="btn btn-primary mt-2">Zatwierdź</button>
    </form>
  </div>
</template>
