<template>
  <div id="projects">
    <h2 class="projects--title">Projects</h2>
    <div>
      <Project
        title="Lightning Hacks"
        description="Co-creator of the Lightning Hacks initiative and designer of the brand identity."
      />
    </div>
  </div>
</template>

<script>
import Project from "./Project.vue";
export default {
  name: "Projects",
  components: {
    Project
  }
};
</script>

<style>
#projects {
  margin-top: 25vh;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.projects--title {
  color: white;
  font-size: 4em;
  font-weight: bold;
}
</style>