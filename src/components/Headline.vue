<template>
  <div id="headline">
    <img class="headline--user-picture" src="../assets/user-picture.jpg" alt />
    <h1 class="headline--title">{{msg}}</h1>
  </div>
</template>

<script>
export default {
  name: "Headline",
  mounted() {
    let tl = this.$anime.timeline({
      easing: "easeOutExpo"
    });

    tl.add({
      targets: ".headline--title",
      opacity: [0, 1],
      scale: [0.2, 1],
      duration: 1400
    });

    tl.add({
      targets: ".headline--user-picture",
      opacity: [0, 1],
      duration: 1200
    });
  },
  props: {
    msg: String
  }
};
</script>

<style>
#headline {
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.headline--title {
  color: white;
  font-size: 4em;
  font-weight: bold;
}

.headline--user-picture {
  max-height: 60vh;
  width: auto;
  border-radius: 50%;
  margin-bottom: 2em;
}

@media (max-width: 800px) {
  .headline--user-picture {
    max-width: 70vw;
  }

  .headline--title {
    font-size: 2em;
  }
}
</style>