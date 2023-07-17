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
      newSources: [...this.sources],
    };
  },
  mounted() {
    this.isAuth = localStorage.getItem("isAuth") === "true";
    this.isAdmin = localStorage.getItem("isAdmin") === "true";
  },
  methods: {
    switchEdit() {
      this.isEdited = !this.isEdited;
      this.newSources = [...this.sources];
      console.log(this.sources);
      this.$refs.list.classList.toggle("hidden");
      this.$refs.form.classList.toggle("hidden");
    },

    onTrashClick(ev) {
      const sourceContainer = ev.target.closest(".edit-source-container");
      const href = sourceContainer.querySelector("a").getAttribute("href");

      // update newSources
      // node element will disappear automatically
      this.newSources = this.newSources.filter((source) => source !== href);
      console.log(this.sources);
    },

    checkUrlInput(url) {
      const urlPattern =
        /^(http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;
      return urlPattern.test(url) && !this.newSources.includes(url);
    },

    onUrlInput(ev) {
      const url = ev.target.value;

      const editIcon = this.$refs.editIcon;
      if (this.checkUrlInput(url)) {
        if (editIcon.classList.contains("disabled")) {
          editIcon.classList.remove("disabled");
        }
      } else {
        if (!editIcon.classList.contains("disabled")) {
          editIcon.classList.add("disabled");
        }
      }
    },

    onUrlInputEnterPress(ev) {
      const keyCode = ev.code || ev.key;
      if (keyCode === "Enter") {
        ev.preventDefault();
        this.pushNewSource();
      }
    },

    onCancelButtonClick(ev) {
      ev.preventDefault();
      this.switchEdit();
    },

    pushNewSource() {
      const sourceContainer = document.querySelector("input[type=url]");
      if (this.checkUrlInput(sourceContainer.value)) {
        this.newSources.push(sourceContainer.value);
        sourceContainer.value = "";
        this.$refs.editIcon.classList.add("disabled");
      }
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
        let message = await res.json();
        console.log(message);
        let type;
        if (this.isAdmin) {
          if (res.status === 200) {
            message = "Zmiana zapisana.";
            type = "info";
          } else {
            message = `Wystąpił błąd nr ${res.status}: ${message.message}`;
            type = "danger";
          }
        } else {
          if (res.status === 200) {
            message = "Wysłano sugestię zmiany.";
            type = "info";
          } else {
            message = `Wystąpił błąd nr ${res.status}: ${message.message}`;
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
        v-for="(source, index) in newSources"
        :key="index"
      >
        <a :href="source" target="_blank" rel="noopener">{{ source }}</a>
        <i class="edit-icon fa-solid fa-trash p-2" @click="onTrashClick"></i>
      </div>
      <div class="edit-source-container my-3">
        <input
          type="url"
          class="form-control"
          @input="onUrlInput"
          @keypress="onUrlInputEnterPress"
        />
        <i
          class="edit-icon fa-solid fa-plus p-2 disabled"
          ref="editIcon"
          @click="pushNewSource"
        ></i>
      </div>
      <button type="submit" class="btn btn-primary mt-2 me-3 mb-3">
        Zatwierdź
      </button>
      <button @click="onCancelButtonClick" class="btn btn-primary mt-2 mb-3">
        Anuluj
      </button>
    </form>
  </div>
</template>
