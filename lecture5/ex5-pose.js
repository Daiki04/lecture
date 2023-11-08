// ビデオ要素の取得
const video = document.getElementById('myVideo');
// Canvas要素の取得
const canvas = document.getElementById('myCanvas');
// heatmap用のCanvas要素の取得
const heatmapCanvas = document.getElementById('heatmap');
// bodyCanvas要素の取得
const bodyCanvas = document.getElementById('bodyCanvas');
// 描画命令の準備
const ctx = canvas.getContext('2d');
// heatmap用の描画命令の準備
const heatmapCtx = heatmapCanvas.getContext('2d');
// bodyCanvas用の描画命令の準備
const bodyCtx = bodyCanvas.getContext('2d');

// 検出器・推論結果
let detector, poses;

// body画像
let img;

// keyGraph
let keyGraph = {
  4: [2],
  2: [0],
  0: [1],
  1: [3],
  3: -1,
  10: [8],
  8: [6],
  6: [5, 12],
  5: [7, 11],
  7: [9],
  9: -1,
  12: [11, 14],
  14: [16],
  16: -1,
  11: [13],
  13: [15],
  15: -1,
}

const getGradientColor = (value) => {

  // 青から赤へのグラデーションを計算
  const r = Math.round(255 * value);
  const g = 0;
  const b = Math.round(255 * (1 - value));

  // RGB値を16進数に変換してカラーコードを作成
  const hexColor = `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;

  return hexColor;
}

const drawHeatmap = () => {
  // 横方向のheatmapbarを描画
  base_width = heatmapCanvas.width / 256;
  for (let i = 0; i < 256; i++) {
    heatmapCtx.fillStyle = getGradientColor(i / 255);
    heatmapCtx.fillRect(i * base_width, 0, base_width, heatmapCanvas.height);
  }
}

// 初期化処理（非同期）
const init = async () => {
  // Webカメラの映像を取得
  video.srcObject = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });

  await new Promise(resolve => { video.onloadedmetadata = () => { resolve(video); }; });

  // モデルの読み込みが終わるまで待つ
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

  // Webカメラの再生
  video.play();
  draw();
}

const draw_img = () => {
  img = new Image();
  img.src = "body.png";
  img.onload = () => {
    bodyCtx.drawImage(img, 0, 0, bodyCanvas.width, bodyCanvas.height);
  }

}

// 描画処理（非同期）
const draw = async () => {
  const R = 10;
  poses = await detector.estimatePoses(video);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (poses) {
    let pose = poses[0].keypoints;

    for (let i = 0; i < pose.length; i++) {
      console.log(pose[i]);
      ctx.beginPath();
      ctx.arc(pose[i].x, pose[i].y, R, 0, Math.PI * 2, true);
      ctx.fillStyle = getGradientColor(pose[i].score);
      ctx.fill();

      // 点の番号を描画
      ctx.fillStyle = "black";
      ctx.font = "20px serif";
      ctx.fillText(i, pose[i].x - 10, pose[i].y - 10);


      // 次の点と線で結ぶ
      if (keyGraph[i] !== -1) {
        for (let j = 0; j < keyGraph[i].length; j++) {
          ctx.beginPath();
          ctx.moveTo(pose[i].x, pose[i].y);
          ctx.lineTo(pose[keyGraph[i][j]].x, pose[keyGraph[i][j]].y);
          ctx.strokeStyle = "black";
          ctx.stroke();
        }
      }
    }
    // left_eye = poses[0].keypoints[1];
    // console.log(left_eye);
    // right_eye = poses[0].keypoints[2];
    // console.log(right_eye);
    // ctx.strokeRect(left_eye.x - W / 2, left_eye.y - H / 2, W, H);
    // ctx.strokeRect(right_eye.x - W / 2, right_eye.y - H / 2, W, H);
  }
  requestAnimationFrame(draw);
}

drawHeatmap();
draw_img();
init();