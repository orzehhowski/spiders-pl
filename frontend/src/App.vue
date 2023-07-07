<script setup>
import { RouterView } from "vue-router";
import TheNavbar from "./components/TheNavbar.vue";
import MessageAlert from "./components/MessageAlert.vue";
</script>

<script>
export default {
  components: {
    TheNavbar,
    MessageAlert,
  },
  data() {
    return {
      messages: [],
      isAuth: false,
      isAdmin: false,
      isOwner: false,
      userId: null,
      token: null,
    };
  },
  methods: {
    // Message after displaying is removed from localStorage
    readMessageFromStorage() {
      const savedMess = localStorage.getItem("message");
      localStorage.removeItem("message");
      this.messages = savedMess ? [JSON.parse(savedMess)] : [];
    },

    async login(email, password) {
      // Send login request
      const res = await fetch(`${this.$API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const resBody = await res.json();
      if (res.status !== 200) {
        if (res.status === 401) {
          this.messages.push({
            message: "Błędny email lub hasło.",
            type: "danger",
          });
        } else {
          this.messages.push({
            message: "Wystąpił błąd. Spróbuj ponownie później.",
            type: "danger",
          });
        }
      } else {
        this.isAuth = true;
        this.isAdmin = resBody.isAdmin;
        this.isOwner = resBody.isOwner;
        this.userId = resBody.userId;
        this.token = resBody.token;
        localStorage.setItem("token", resBody.token);
        localStorage.setItem("isAdmin", resBody.isAdmin);
        localStorage.setItem("isAuth", true);
        localStorage.setItem("userId", resBody.userId);
        localStorage.setItem("isOwner", resBody.isOwner);
        const remainingMs = 12 * 60 * 60 * 1000;
        const expiryDate = new Date(new Date().getTime() + remainingMs);
        localStorage.setItem("expiryDate", expiryDate.toISOString());
        location.replace("/");
      }
    },

    async signup(email, password, username) {
      const res = await fetch(`${this.$API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username: username || null }),
      });
      const resBody = res.json();
      if (res.status !== 201) {
        this.messages.push({
          message: "cos jest zle, domysl sie frajerze",
          type: "danger",
        });
      } else {
        this.isAuth = true;
        this.userId = resBody.userId;
        this.token = resBody.token;
        localStorage.setItem("token", resBody.token);
        localStorage.setItem("isAuth", true);
        localStorage.setItem("userId", resBody.userId);
        const remainingMs = 12 * 60 * 60 * 1000;
        const expiryDate = new Date(new Date().getTime() + remainingMs);
        localStorage.setItem("expiryDate", expiryDate.toISOString());
        localStorage.setItem(
          "message",
          JSON.stringify({
            type: "success",
            message: `Witaj${
              username ? ", " + username : ""
            }! Dziękujemy za dołączenie do społeczności.`,
          })
        );
        location.replace("/");
      }
    },

    logout() {
      this.isAuth = false;
      this.isAdmin = false;
      this.isOwner = false;
      this.userId = null;
      this.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("isAuth");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userId");
      localStorage.removeItem("isOwner");
      localStorage.removeItem("expiryDate");
      location.replace("/");
    },
  },
  mounted() {
    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      this.logout();
      return;
    }
    this.userId = +localStorage.getItem("userId");
    this.isAuth = !!localStorage.getItem("isAuth");
    this.isAdmin = !!localStorage.getItem("isAdmin");
    this.token = token;
  },
  created() {
    this.readMessageFromStorage();
  },
};
</script>

<template>
  <TheNavbar
    :isAuth="isAuth"
    :isAdmin="isAdmin"
    :userId="userId"
    :token="token"
    :logoutHandler="logout"
  />
  <MessageAlert :messages="messages" />
  <RouterView
    :isAuth="isAuth"
    :isAdmin="isAdmin"
    :userId="userId"
    :token="token"
    :loginHandler="login"
    :logoutHandler="logout"
    :signupHandler="signup"
  />
</template>

<style lang="scss">
.italic {
  font-style: italic;
}

.hidden {
  display: none;
}

hr.small {
  max-width: 36rem;
}

.title-container {
  max-width: 36rem;
  display: flex;
  justify-content: space-between;
}

.sources {
  overflow-x: hidden;
}

.edit-icon {
  font-size: 1.2rem;
  cursor: pointer;
}

.edit-icon.disabled {
  color: gray;
  cursor: default;
}

.edit-source-container {
  max-width: 36rem;
  display: flex;
  justify-content: space-between;
}

.carousel {
  border-radius: 10px;
  max-height: 30rem;
  max-width: 36rem;
  overflow: hidden;
  img {
    object-fit: cover;
  }
}
</style>
