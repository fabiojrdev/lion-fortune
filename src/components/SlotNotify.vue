<template>
  <div class="container-notify" :disabled="disabled" :updateInfo="updateInfo">
    <span class="close-button" :close="close">X</span>
    <div class="notify-title">
      {{ title }}
    </div>
    <div class="notify-description">
      {{ description }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    description: String,
    close: Boolean,
  },
  methods: {
    updateInfo() {
      this.$emit("updateInfo");
    },
  },
};
</script>

<style scoped>
.container-notify {
  position: absolute;
  left: 5%;
  background: rgba(0, 0, 0, 0.504);
  padding: 10px;
  border-radius: 10px;
  text-align: start;
  transform: translateY(20px); /* Inicialmente posicionado para baixo */
  opacity: 0; /* Inicialmente invisível */
  animation: slideUp 0.5s forwards; /* Aplica a animação */
}
.close-button {
  position: absolute;
  right: 2%;
  top: 2%;
  font-size: 12px;
  padding: 5px;
  color: red;
}
.notify-title {
  font-size: 12px;
  color: gold;
  text-transform: uppercase;
}
.notify-description {
  font-size: 10px;
  color: white;
}

@keyframes slideUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
