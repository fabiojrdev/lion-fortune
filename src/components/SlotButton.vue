<template>
  <button @click="handleClick" :disabled="disabled" class="slot-button">
    {{ text }}
  </button>
</template>

<script>
export default {
  props: {
    text: String,
    disabled: Boolean,
  },
  methods: {
    handleClick() {
      this.$emit("click");
    },
  },
};
</script>

<style scoped>
.slot-button {
  position: relative;
  padding: 10px 20px;
  /* margin-top: 20px; */
  margin-top: -20px;
  cursor: pointer;
}
</style>
