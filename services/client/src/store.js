import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import * as faceapi from 'face-api.js';

export default new Vuex.Store({
  state: {
    videoStream: null,
    faces: [],
    loading: false,
    loaded: false,
    faceMatcher: null,

    useTiny: false,

    detections: {
      scoreThreshold: 0.5,
      inputSize: 320,
      boxColor: 'blue',
      textColor: 'red',
      lineWidth: 1,
      fontSize: 20,
      fontStyle: 'Georgia'
    },
    expressions: {
      minConfidence: 0.2
    },
    landmarks: {
      drawLines: true,
      lineWidth: 1
    },
    descriptors: {
      withDistance: false
    }
  },
  mutations: {
    start (state, video) {
      state.videoStream = video
    },
    stop (state) {
      if (state.videoStream) {
        state.videoStream.getTracks().forEach(track => track.stop())
        state.videoStream = null
      }
    },
    loading (state) {
      state.loading = true
    },
  
    load (state) {
      state.loading = false
      state.loaded = true
    },
  
    setFaces (state, faces) {
      state.faces = faces
    },
  
    setFaceMatcher (state, matcher) {
      state.faceMatcher = matcher
    }
  },
  actions: {
    async startCamera ({ commit, state }) {
      if (!state.videoStream &&
        navigator &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          .catch((e) => {
            console.log(e)
            throw new Error(e)
          })
        commit('start', stream)
        return stream
      } else {
        throw new Error('This browser doesn\'t support WebRTC')
      }
    },
    stopCamera ({ commit }) {
      commit('stop')
    },
    load ({ commit, state }) {
      console.log('test');
      if (!state.loading && !state.loaded) {
        console.log('test1');
        commit('loading')
        return Promise.all([
          faceapi.loadFaceRecognitionModel('/static/data/models'),
          faceapi.loadFaceLandmarkModel('/static/data/models'),
          faceapi.loadTinyFaceDetectorModel('/static/data/models'),
          faceapi.loadFaceExpressionModel('/static/data/models')
        ])
          .then(() => {
            commit('load')
          })
      }
    },
    async getAll ({ commit, state }) {
      const data = await this.$axios.$get('/api/face/getAll')
      commit('setFaces', data)
    },
    async save ({ commit }, faces) {
      const { data } = await this.$axios.$post('/api/face/save', { faces })
      commit('setFaces', data)
    },
    getFaceMatcher ({ commit, state }) {
      const labeledDescriptors = []
      state.faces.forEach((face) => {
        const descriptors = face.descriptors.map((desc) => {
          if (desc.descriptor) {
            const descArray = []
            for (const i in desc.descriptor) {
              descArray.push(parseFloat(desc.descriptor[i]))
            }
            return new Float32Array(descArray)
          }
        })
        if (descriptors.length) {
          labeledDescriptors.push(
            new faceapi.LabeledFaceDescriptors(
              face.user,
              descriptors
            ))
        }
      })
      const matcher = new faceapi.FaceMatcher(labeledDescriptors)
      commit('setFaceMatcher', matcher)
      return matcher
    },
    async getFaceDetections ({ commit, state }, { canvas, options }) {
      let detections = faceapi
        .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({
          scoreThreshold: state.detections.scoreThreshold,
          inputSize: state.detections.inputSize
        }))
  
      if (options && (options.landmarksEnabled || options.descriptorsEnabled)) {
        detections = detections.withFaceLandmarks(state.useTiny)
      }
      if (options && options.expressionsEnabled) {
        detections = detections.withFaceExpressions()
      }
      if (options && options.descriptorsEnabled) {
        detections = detections.withFaceDescriptors()
      }
      detections = await detections
      return detections
    },
    async recognize ({ commit, state }, { descriptor, options }) {
      if (options.descriptorsEnabled) {
        const bestMatch = await state.faceMatcher.findBestMatch(descriptor)
        return bestMatch
      }
      return null
    },
  
    draw ({ commit, state }, { canvasDiv, canvasCtx, detection, options }) {
      let emotions = ''
      // filter only emontions above confidence treshold and exclude 'neutral'
      if (options.expressionsEnabled && detection.expressions) {
        for (const expr in detection.expressions) {
          if (detection.expressions[expr] > state.expressions.minConfidence && expr !== 'neutral') {
            emotions += ` ${expr} &`
          }
        }
        if (emotions.length) {
          emotions = emotions.substring(0, emotions.length - 2)
        }
      }
      let name = ''
      if (options.descriptorsEnabled && detection.recognition) {
        name = detection.recognition.toString(state.descriptors.withDistance)
      }
  
      const text = `${name}${emotions ? (name ? ' is ' : '') : ''}${emotions}`
      const box = detection.box || detection.detection.box
      if (options.detectionsEnabled && box) {
        // draw box
        canvasCtx.strokeStyle = state.detections.boxColor
        canvasCtx.lineWidth = state.detections.lineWidth
        canvasCtx.strokeRect(box.x, box.y, box.width, box.height)
      }
      if (text && detection && box) {
        // draw text
        const padText = 2 + state.detections.lineWidth
        canvasCtx.fillStyle = state.detections.textColor
        canvasCtx.font = state.detections.fontSize + 'px ' + state.detections.fontStyle
        canvasCtx.fillText(text, box.x + padText, box.y + box.height + padText + (state.detections.fontSize * 0.6))
      }
  
      if (options.landmarksEnabled && detection.landmarks) {
        faceapi.draw.drawFaceLandmarks(canvasDiv, detection.landmarks, { lineWidth: state.landmarks.lineWidth, drawLines: state.landmarks.drawLines })
      }
    },
  
    async createCanvas ({ commit, state }, elementId) {
      const canvas = await faceapi.createCanvasFromMedia(document.getElementById(elementId))
      return canvas
    }
  },
  getters: {
    isCameraStarted: (state) => {
      return !!state.videoStream
    }
  }
});