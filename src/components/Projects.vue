<template>
  <div id="projects">
    <h2 class="projects--title">Projects</h2>
    <div>
      <Project
        title="Ijano Lopes"
        description="Designer of the brand identity of the architecture firm Ijano Lopes."
        image="/ijanolopes-logo.svg"
      />
    </div>

    <div>
      <Project
        title="Lightning Hacks"
        description="Co-creator of the Lightning Hacks initiative and designer of the brand identity."
        image="/lh-logo.svg"
      />
    </div>

    <Project
      title="HackSBSeg"
      description="Co-organizer of the HackSBSeg hackathon and designer of the brand identity."
      image="/hacksbseg-logo.svg"
    />
    <div>
      <Project
        title="REGEX"
        description="Designer of the brand identity of the REGEX group."
        image="/regex-logo.svg"
      />
    </div>
    <Project
      title="BRiD"
      description="Designer and front-end developer of the BRiD project for the Campus Mobile 7th edition."
      image="/brid-logo.svg"
    />
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
  margin-top: 25em;
  color: white;
  min-height: 100vh;
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
