// ビデオ要素の取得
const video = document.getElementById('myVideo');
// Canvas要素の取得
const canvas = document.getElementById('myCanvas');
// heatmap用のCanvas要素の取得
const heatmapCanvas = document.getElementById('heatmap');
// 描画命令の準備
const ctx = canvas.getContext('2d');
// heatmap用の描画命令の準備
const heatmapCtx = heatmapCanvas.getContext('2d');
// 物体検出用変数
let img, model, predictions;

const getGradientColor = (value) => {

  // 青から赤へのグラデーションを計算
  const r = Math.round(255 * value);
  const g = 0;
  const b = Math.round(255 * (1 - value));

  // RGB値を16進数に変換してカラーコードを作成
  const hexColor = `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;

  return hexColor;
}

const init = async () => {
  ctx.font = '24px \'ＭＳ Ｐゴシック\'';

  // Webカメラの映像を取得
  video.srcObject = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });

  await new Promise(resolve => { video.onloadedmetadata = () => { resolve(video); }; });

  // COCO-SSD のロード（演習 5-2）
  model = await cocoSsd.load();

  // Webカメラの再生
  video.play();
  draw();
}

const drawHeatmap = () => {
  // 横方向のheatmapbarを描画
  base_width = heatmapCanvas.width / 256;
  for (let i = 0; i < 256; i++) {
    heatmapCtx.fillStyle = getGradientColor(i / 255);
    heatmapCtx.fillRect(i * base_width, 0, base_width, heatmapCanvas.height);
  }
}

const draw = async () => {
  ctx.lineWidth = 6;
  // Webカメラの映像を Canvas に描画
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let best_prob = 0.0;
  let best_idx = 0;

  // 物体検出（演習 5-2）
  predictions = await model.detect(video, 10, 0.2);

  for (let i = 0; i < predictions.length; i++) {
    let obj = predictions[i];
    if (obj.score > best_prob) {
      best_prob = obj.score;
      best_idx = i;
    }
  }

  // console.log(predictions);
  for (let i = 0; i < predictions.length; i++) {
    let bbox = predictions[i].bbox
    let label = predictions[i].class
    let prob = predictions[i].score.toPrecision(5)

    if (i == best_idx) {
      ctx.strokeStyle = 'lime';
      ctx.fillStyle = 'lime';
    } else {
      ctx.strokeStyle = getGradientColor(prob);
      ctx.fillStyle = getGradientColor(prob);
    }

    // console.log(getGradientColor(prob));
    ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
    ctx.beginPath();
    ctx.rect(bbox[0] - 3, bbox[1] - 20, 200, 20);
    ctx.fill();
    ctx.closePath();
    if (i == best_idx) {
      ctx.fillStyle = 'red';
    } else {
      ctx.fillStyle = 'white';
    }
    ctx.fillText(label + ' : ' + prob, parseInt(bbox[0], 10), parseInt(bbox[1], 10));
  }

  requestAnimationFrame(draw);
}

drawHeatmap();
init();