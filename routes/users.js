var express = require('express');
var router = express.Router();
const multer  = require('multer');
const upload = multer(); // 使用默认配置
const bodyParser = require('body-parser');
const canvas = require('canvas')
const faceapi = require('../middleware/faceApiController');
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
const Jimp = require('jimp')
import '@tensorflow/tfjs-node';

router.use(bodyParser.json({ limit: '10mb' }));  // Increase limit if necessary
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/test', upload.single('imgFile') ,async function(req, res, next) {
    try {
        // 图片文件
        const imgFile = req.file;
        // 路径
        const imgUrl = req.body.imgUrl;

        if (!imgFile && !imgUrl) {
            return res.status(400).send({
                code: 400,
                data: '',
                message: '上传参数不正确'
            });
        }

        let img;
        let imgBuffer;

        if (imgFile) {
            // 从文件加载图片
            imgBuffer = imgFile.buffer
        } else if (imgUrl) {
            // 从网络路径加载图片
            let jimpImage = await Jimp.read(imgUrl);
            imgBuffer = await jimpImage.getBufferAsync(Jimp.AUTO);
        }
        // 将图片从二进制转为canvas
        img = await canvas.loadImage(imgBuffer);
        // const faceDescription = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }));
        let faceDescription = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 1024, scoreThreshold: 0.4}));
        console.log(faceDescription)
        if (faceDescription.length === 0) { // 未检测到人脸
            for(let i = 0; i<3; i++){
                console.log('进行一次旋转')
                // 将二进制图像数据转换为 Jimp 对象
                jimpImage = await Jimp.read(imgBuffer);
                
                // 对图像进行旋转
                jimpImage.rotate(90);
                
                // 将旋转后的图像转换为二进制数据
                imgBuffer = await jimpImage.getBufferAsync(Jimp.MIME_JPEG);
                
                img = await canvas.loadImage(imgBuffer);
                
                // 重新进行人脸检测
                faceDescription = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 1024, scoreThreshold: 0.4 }));
                
                if (faceDescription.length !== 0) {
                    break;
                }
            }
        }
        if (faceDescription.length === 0) { // 没有有面部识别信息
            res.status(200).send({
                code: 204,
                message: '未检测到人脸，请重新上传图片',
                data: ''

            });
        } else if(faceDescription.length === 1 ) { // 仅有1张人脸信息
            res.status(200).send({
                code: 200,
                message: '检测成功',
                data: faceDescription
            });
        } else { // 多张人脸
            res.status(200).send({
                code: 202,
                message: '检测到多张脸，请重新上传图片',
                data: faceDescription,
            });
        }
    } catch (error) {
        res.status(500).send({
            code: 202,
            data: '',
            message: error.toString()
        });
    }
});

module.exports = router;