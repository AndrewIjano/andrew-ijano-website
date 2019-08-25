<template>
  <div id="headline">
    <img class="user-picture" src="../assets/user-picture.jpg" alt />
    <h1 class="title">{{msg}}</h1>
  </div>
</template>

<script>
export default {
  name: "Headline",
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
.title {
  color: white;
  font-size: 4em;
  font-weight: bold;
}

.user-picture {
  max-height: 60vh;
  width: auto;
  border-radius: 50%;
  margin-bottom: 2em;
}

@media (max-width: 800px) {
  .user-picture {
    max-width: 70vw;
  }

  .title {
    font-size: 2em;
  }
}
</style>