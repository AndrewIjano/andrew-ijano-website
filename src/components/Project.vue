<template>
  <div data-aos="fade-up-right" data-aos-duration="3000" id="project">
    <img class="project--logo" :src="image" />
    <div class="project--text">
      <h3 class="project--title">{{title}}</h3>
      <p class="project--descr">{{description}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Project",
  props: {
    title: String,
    description: String,
    image: String
  }
};
</script>

<style>
#project {
  color: white;
  margin-top: 4em;
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 90vw;
  min-height: 90vh;
}
.project--text {
  max-width: 50%;
}
.project--title {
  font-size: 2.5em;
  font-weight: bold;
}
.project--descr {
  color: lightgray;
  font-size: 1.5em;
}
.project--logo {
  height: 50vh;
  max-width: 45vh;
}
</style>