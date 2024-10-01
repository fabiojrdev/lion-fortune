<template>
  <div id="app">
    <SlotMachine />
  </div>
</template>

<script>
import SlotMachine from "./components/SlotMachine.vue"; // Importa o componente principal

export default {
  name: "App",
  components: {
    SlotMachine, // Registra o componente
  },
};
</script>

<style>
body {
  width: 100vw;
  height: 100vh;
  background-image: url("@/assets/background-global.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  overflow: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: center;
  /* margin-top: 60px; */
}
</style>
