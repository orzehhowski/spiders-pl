<script>
import { RouterLink } from "vue-router";
export default {
  props: {
    loginHandler: Function,
    logoutHandler: Function,
    isAuth: Boolean,
    isAdmin: Boolean,
    token: String,
    userId: Number,
  },
  components: {
    RouterLink,
  },
  data() {
    return {
      searchData: "",
    };
  },
};
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-secondary sticky-top">
    <div class="container">
      <RouterLink to="/" class="navbar-brand"
        ><i class="fa-solid fa-spider"></i>Polskie pająki</RouterLink
      >
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink
              to="/add-spider"
              :class="`nav-link ${!isAuth && 'disabled'}`"
              >Dodaj gatunek</RouterLink
            >
          </li>
          <li v-if="isAdmin" class="nav-item">
            <RouterLink to="/suggestions" class="nav-link">Sugestie</RouterLink>
          </li>
          <li v-if="isAdmin" class="nav-item">
            <RouterLink to="/users" class="nav-link">Użytkownicy</RouterLink>
          </li>
        </ul>
        <ul class="navbar-nav ml-3 mb-2 mb-lg-0">
          <li v-if="!isAuth" class="nav-item">
            <RouterLink
              to="/login"
              :loginHandler="loginHandler"
              class="nav-link"
              >Zaloguj</RouterLink
            >
          </li>
          <li v-if="!isAuth" class="nav-item">
            <RouterLink to="/signup" class="nav-link">Utwórz konto</RouterLink>
          </li>

          <li v-else class="nav-item">
            <a class="nav-link" @click="logoutHandler">Wyloguj</a>
          </li>
          <li>
            <form class="d-flex search-form">
              <input
                v-model="searchData"
                class="form-control me-2"
                type="search"
                placeholder="Szukaj"
                aria-label="Search"
              />
              <RouterLink
                :to="`/search/` + searchData"
                class="btn btn-outline-dark"
                >Szukaj</RouterLink
              >
            </form>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style>
input {
  max-width: 500px;
}

a {
  cursor: pointer;
}
</style>
