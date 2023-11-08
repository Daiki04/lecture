// ビデオ要素の取得
const video = document.getElementById('myVideo');
// Canvas要素の取得
const canvas = document.getElementById('myCanvas');
// 描画命令の準備
const ctx = canvas.getContext('2d');
// 物体検出用変数
let img, model, predictions;

const init = async () => {

  ctx.font = 'bold 50px sans-serif';

  // Webカメラの映像を取得
  video.srcObject = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });

  await new Promise(resolve => { video.onloadedmetadata = () => { resolve(video); }; });

  // COCO-SSD のロード
  model = await cocoSsd.load();

  // Webカメラの再生
  video.play();
  draw();
}

const draw = async () => {
  // Webカメラの映像を Canvas に描画
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 物体検出
  predictions = await model.detect(video);
  // console.log(predictions);


  for (let i = 0; i < predictions.length; i++) {
    let obj = predictions[i];

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 10;
    ctx.strokeRect(obj.bbox[0], obj.bbox[1], obj.bbox[2], obj.bbox[3]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(obj.bbox[0], obj.bbox[1], obj.bbox[2], obj.bbox[3]);

    ctx.fillText(obj.class + '(' + obj.score.toFixed(2) + ')', obj.bbox[0], obj.bbox[1]);

  }

  requestAnimationFrame(draw);

}

init();