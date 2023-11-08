// 基礎
// let x = 10; // 変数
// const y = 20; // 定数

/* DOM操作 */
// canvas要素の取得
const canvas = document.getElementById('myCanvas');
// canvas要素の2D描画コンテキストを取得：描画命令を発行するためのオブジェクト
const context = canvas.getContext('2d');

context.strokeStyle = 'black'; // 線の色
context.lineWidth = 20; // 線の太さ
context.lineCap = 'round'; // 線の端の形状

// 背景の塗りつぶし
context.fillStyle = 'white'; // 塗りつぶしの色
context.fillRect(0, 0, canvas.width, canvas.height); // 塗りつぶし: (x, y, width, height)

// 矩形の塗りつぶし
// context.fillRect(10, 10, 100, 100); // 塗りつぶし: (x, y, width, height)
// // 矩形の枠線
// context.strokeRect(120, 10, 100, 100); // 枠線: (x, y, width, height)

// 線の描画
// context.strokeStyle = 'red'; // 線の色
// context.lineWidth = 5; // 線の太さ
// context.lineCap = 'round'; // 線の端の形状
// context.beginPath(); // パスの開始
// context.moveTo(10, 10); // 始点
// context.lineTo(100, 100); // 終点
// context.stroke(); // 線の描画

// 描画関数
const draw = (event) => {
    // パスの開始
    context.beginPath();
    // 始点
    context.moveTo(event.offsetX, event.offsetY);
    // 終点
    context.lineTo(event.offsetX - event.movementX, event.offsetY - event.movementY);
    // 線の描画
    context.stroke();
}

// マウスの操作
// addEventListener: イベントの登録
canvas.addEventListener('mousemove', (event) => {
    if (event.buttons === 1) {
        // マウスの左ボタンが押されているとき
        draw(event);
    }
});

// クリアボタン
const reset = () => {
    context.fillStyle = 'white'; // 塗りつぶしの色
    context.fillRect(0, 0, canvas.width, canvas.height); // 塗りつぶし: (x, y, width, height)
}

const upload = () => {
    const dataURL = canvas.toDataURL("image/png");
    
    fetch("/upload", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: dataURL }),
    })
    .then((response) => response.json())
    .then((data) => {
        content = "<h1>予測結果</h1>" + 
        "<h2>" + data["prediction"] + "</h2>" +
        "<img id='uploadImage' src='" + data["uriImage"] + "' alt='uploadImage' width='" + canvas.width + "' height='" + canvas.height + "'>";
        document.getElementById("resultArea").innerHTML = content;
    });
}



