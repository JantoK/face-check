var express = require('express');
var router = express.Router();
const multer  = require('multer');
const upload = multer(); // 使用默认配置
const bodyParser = require('body-parser');
const canvas = require('canvas')
const faceapi = require('../middleware/faceApiController');
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

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
            return res.status(400).send('必须上传图片文件或图片路径之一');
        }

        let img;

        if (imgFile) {
            // 从文件加载图片
            img = await canvas.loadImage(imgFile.buffer);
        } else if (imgUrl) {
            // 从网络路径加载图片
            img = await canvas.loadImage(imgUrl);
        }
        const faceDescription = await faceapi.detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }));
        console.log(faceDescription)
        if (faceDescription.length === 0) { // 没有有面部识别信息
            res.status(404).send('未检测到人脸信息，请重拍');
        } else if(faceDescription.length === 1 ) { // 仅有1张人脸信息
            res.json({ faceDescription });
        } else {
            res.status(404).send('照片中人脸信息超出1人，请重拍');
        }
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

module.exports = router;