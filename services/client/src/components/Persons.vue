<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-10">
        <h1>KYC&AML</h1>
        <hr><br><br>
        <v-card-actions class="justify-center">
          <v-btn-toggle v-model="withOptions" multiple>
            <v-btn>
              <v-icon>check_box_outline_blank</v-icon>
              <span>Detection</span>
            </v-btn>
            <v-btn>
              <v-icon>face</v-icon>
              <span>Landmarks</span>
            </v-btn>
            <v-btn>
              <v-icon>how_to_reg</v-icon>
              <span>Recognition</span>
            </v-btn>
            <v-btn>
              <v-icon>insert_emoticon</v-icon>
              <span>Emotion</span>
            </v-btn>
          </v-btn-toggle>
        </v-card-actions>
          <div>
            <video
              id="live-video"
              width="320"
              height="247"
              autoplay
            />
          </div>
          <div>
            <canvas
              id="live-canvas"
              width="320"
              height="247"
            />
          </div>
        <alert :message=message v-if="showMessage"></alert>
        <button type="button" class="btn btn-success btn-sm" v-b-modal.person-modal>
          Add Person
        </button>
        <br><br>
        <table class="table table-hover">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">BioHash</th>
              <th scope="col">Block?</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(person, index) in persons" :key="index">
              <td>{{ person.title }}</td>
              <td>{{ person.biohash }}</td>
              <td>
                <span v-if="person.block">Yes</span>
                <span v-else>No</span>
              </td>
              <td>
                <button
                        type="button"
                        class="btn btn-warning btn-sm"
                        v-b-modal.person-update-modal
                        @click="editPerson(person)">
                    Update
                </button>
                <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        @click="onDeletePerson(person)">
                    Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <b-modal ref="addPersonModal"
             id="person-modal"
             title="Add a new person"
             hide-footer>
      <b-form @submit="onSubmit" @reset="onReset" class="w-100">
      <b-form-group id="form-title-group"
                    label="Title:"
                    label-for="form-title-input">
          <b-form-input id="form-title-input"
                        type="text"
                        v-model="addPersonForm.title"
                        required
                        placeholder="Enter title">
          </b-form-input>
        </b-form-group>
        <b-form-group id="form-biohash-group"
                      label="BioHash:"
                      label-for="form-biohash-input">
            <b-form-input id="form-biohash-input"
                          type="text"
                          v-model="addPersonForm.biohash"
                          required
                          placeholder="Enter biohash">
            </b-form-input>
          </b-form-group>
        <b-form-group id="form-block-group">
          <b-form-checkbox-group v-model="addPersonForm.block" id="form-checks">
            <b-form-checkbox value="true">Block?</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-button type="submit" variant="primary">Submit</b-button>
        <b-button type="reset" variant="danger">Reset</b-button>
      </b-form>
    </b-modal>
    <b-modal ref="editPersonModal"
             id="person-update-modal"
             title="Update"
             hide-footer>
      <b-form @submit="onSubmitUpdate" @reset="onResetUpdate" class="w-100">
      <b-form-group id="form-title-edit-group"
                    label="Title:"
                    label-for="form-title-edit-input">
          <b-form-input id="form-title-edit-input"
                        type="text"
                        v-model="editForm.title"
                        required
                        placeholder="Enter title">
          </b-form-input>
        </b-form-group>
        <b-form-group id="form-biohash-edit-group"
                      label="BioHash:"
                      label-for="form-biohash-edit-input">
            <b-form-input id="form-biohash-edit-input"
                          type="text"
                          v-model="editForm.biohash"
                          required
                          placeholder="Enter biohash">
            </b-form-input>
          </b-form-group>
        <b-form-group id="form-block-edit-group">
          <b-form-checkbox-group v-model="editForm.block" id="form-checks">
            <b-form-checkbox value="true">Block?</b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
        <b-button type="submit" variant="primary">Update</b-button>
        <b-button type="reset" variant="danger">Cancel</b-button>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
import Alert from './Alert';
import $ from 'jquery';
import * as faceapi from 'face-api.js';

export default {
  mounted() {
    // const plugin0 = document.createElement("script");
    // plugin0.setAttribute(
    //   "src",
    //   "https://code.jquery.com/jquery-2.1.1.min.js"
    // );
    // plugin0.async = true;
    // document.head.appendChild(plugin0);

    // this.onPlay();
  },
   watch: {
    fps (newFps) {
      const videoDiv = document.getElementById('live-video')
      const canvasDiv = document.getElementById('live-canvas')
      const canvasCtx = canvasDiv.getContext('2d')
      this.start(videoDiv, canvasDiv, canvasCtx, newFps)
    }
  },
  data() {
    return {
      interval: null,
      fps: 15,
      realFps: 0,
      step: 2,
      counter: 0,
      progress: 0,
      duration: 0,
      isProgressActive: true,
      recognition: '',
      withOptions: [0, 1, 2, 3],
      persons: [],
      addPersonForm: {
        title: '',
        biohash: '',
        block: [],
      },
      editForm: {
        id: '',
        title: '',
        biohash: '',
        block: [],
      },
      message: '',
      showMessage: false,
      ROOT_API: process.env.ROOT_API,
    };
  },
  components: {
    alert: Alert,
  },

  async mounted () {
    const self = this
    await self.$store.dispatch('load')
    await this.recognize()
  },

  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.$store.dispatch('stopCamera')
  },
  methods: {
      start (videoDiv, canvasDiv, canvasCtx, fps) {
        const self = this
        if (self.interval) {
          clearInterval(self.interval)
        }
        self.interval = setInterval(async () => {
          const t0 = performance.now()
          canvasCtx.drawImage(videoDiv, 0, 0, 320, 247)
          const options = {
            detectionsEnabled: self.withOptions.find(o => o === 0) === 0,
            landmarksEnabled: self.withOptions.find(o => o === 1) === 1,
            descriptorsEnabled: self.withOptions.find(o => o === 2) === 2,
            expressionsEnabled: self.withOptions.find(o => o === 3) === 3
          }
          const detections = await self.$store.dispatch('getFaceDetections', { canvas: canvasDiv, options })
          if (detections.length) {
            if (self.isProgressActive) {
              self.increaseProgress()
              self.isProgressActive = false
            }
            detections.forEach(async (detection) => {
              detection.recognition = await self.$store.dispatch('recognize', {
                descriptor: detection.descriptor,
                options
              })
              self.$store.dispatch('draw',
                {
                  canvasDiv,
                  canvasCtx,
                  detection,
                  options
                })
            })
          }
          const t1 = performance.now()
          self.duration = (t1 - t0).toFixed(2)
          self.realFps = (1000 / (t1 - t0)).toFixed(2)
        }, 1000 / fps)
    },
     async recognize () {
      const self = this
      self.increaseProgress()
      await self.$store.dispatch('startCamera')
        .then((stream) => {
          const videoDiv = document.getElementById('live-video')
          const canvasDiv = document.getElementById('live-canvas')
          const canvasCtx = canvasDiv.getContext('2d')
          videoDiv.srcObject = stream

          self.increaseProgress()
          self.start(videoDiv, canvasDiv, canvasCtx, self.fps)
        })
    },

    increaseProgress () {
      const self = this
      self.progress = (100 / self.step) * ++self.counter
    },
    getPersons() {
      const path = `${this.ROOT_API}/persons`;
      // axios.get(path)
      //   .then((res) => {
      //     this.persons = res.data.persons;
      //   })
      //   .catch((error) => {
      //     // eslint-disable-next-line
      //     console.error(error);
      //   });
    },
    addPerson(payload) {
      const path = `${this.ROOT_API}/persons`;
      axios.post(path, payload)
        .then(() => {
          this.getPersons();
          this.message = 'Person added!';
          this.showMessage = true;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
          this.getPersons();
        });
    },
    updatePerson(payload, personID) {
      const path = `${this.ROOT_API}/persons/${personID}`;
      axios.put(path, payload)
        .then(() => {
          this.getPersons();
          this.message = 'Person updated!';
          this.showMessage = true;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
          this.getPersons();
        });
    },
    removePerson(personID) {
      const path = `${this.ROOT_API}/persons/${personID}`;
      axios.delete(path)
        .then(() => {
          this.getPersons();
          this.message = 'Person removed!';
          this.showMessage = true;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
          this.getPersons();
        });
    },
    initForm() {
      this.addPersonForm.title = '';
      this.addPersonForm.biohash = '';
      this.addPersonForm.block = [];
      this.editForm.id = '';
      this.editForm.title = '';
      this.editForm.biohash = '';
      this.editForm.block = [];
    },
    onSubmit(evt) {
      evt.preventDefault();
      this.$refs.addPersonModal.hide();
      let block = false;
      if (this.addPersonForm.block[0]) block = true;
      const payload = {
        title: this.addPersonForm.title,
        biohash: this.addPersonForm.biohash,
        block, // property shorthand
      };
      this.addPerson(payload);
      this.initForm();
    },
    onSubmitUpdate(evt) {
      evt.preventDefault();
      this.$refs.editPersonModal.hide();
      let block = false;
      if (this.editForm.block[0]) block = true;
      const payload = {
        title: this.editForm.title,
        biohash: this.editForm.biohash,
        block,
      };
      this.updatePerson(payload, this.editForm.id);
    },
    onReset(evt) {
      evt.preventDefault();
      this.$refs.addPersonModal.hide();
      this.initForm();
    },
    onResetUpdate(evt) {
      evt.preventDefault();
      this.$refs.editPersonModal.hide();
      this.initForm();
      this.getPersons(); // why?
    },
    onDeletePerson(person) {
      this.removePerson(person.id);
    },
    editPerson(person) {
      this.editForm = person;
    },
  },
  created() {
    this.getPersons();
  },
};
</script>
