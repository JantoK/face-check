const tf = require('@tensorflow/tfjs-node');
const faceapi = require('../middleware/face-api.node.js')
const canvas = require('canvas');

async function loadModels() {
    faceapi.env.monkeyPatch({ Canvas: canvas.Canvas, Image: canvas.Image, ImageData: canvas.ImageData });
    await faceapi.tf.setBackend('tensorflow');
    await faceapi.tf.ready();
    
    await faceapi.nets.tinyFaceDetector.loadFromDisk('./face-api-weights');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./face-api-weights');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./face-api-weights');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./face-api-weights');
}

loadModels(); // 在模块加载时立即加载模型

module.exports = faceapi; // 导出已加载的 faceapi 对象