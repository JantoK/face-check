const faceapi = require('face-api.js');

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./face-api-weights');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./face-api-weights');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./face-api-weights');
}

loadModels(); // 在模块加载时立即加载模型

module.exports = faceapi; // 导出已加载的 faceapi 对象