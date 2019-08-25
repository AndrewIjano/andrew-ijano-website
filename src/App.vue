<template>
  <div id="app">
    <Headline msg="I'm Andrew Ijano" />
    <Projects />
  </div>
</template>

<script>
import Headline from "./components/Headline.vue";
import Projects from "./components/Projects.vue";
export default {
  name: "app",
  components: {
    Headline,
    Projects
  }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap");

* {
  background-color: black;
  margin: 0;
  padding: 0;
}

#app {
  font-family: "Montserrat", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: white;
}
</style>
