<script>
export default {
  props: {
    loginHandler: Function,
  },
  data() {
    return {
      email: "",
      password: "",
      blockSubmit: true,
    };
  },
  methods: {
    onSubmit(ev) {
      ev.preventDefault();
      this.loginHandler(this.email, this.password);
    },
  },
  watch: {
    password(newPassword) {
      if (newPassword === "") {
        this.blockSubmit = true;
      } else {
        if (this.email) {
          this.blockSubmit = false;
        }
      }
    },
    email(newEmail) {
      if (newEmail === "") {
        this.blockSubmit = true;
      } else {
        if (this.password) {
          this.blockSubmit = false;
        }
      }
    },
  },
};
</script>

<template>
  <main class="container">
    <h1 class="mt-3">Zaloguj się</h1>
    <form @submit="onSubmit">
      <div class="mb-3">
        <label for="email" class="form-label">E-mail</label>
        <input v-model="email" type="email" name="email" class="form-control" />
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Hasło</label>
        <input
          type="password"
          name="password"
          v-model="password"
          class="form-control"
        />
      </div>
      <button type="submit" :disabled="blockSubmit" class="btn btn-primary">
        Zaloguj
      </button>
    </form>
  </main>
</template>
