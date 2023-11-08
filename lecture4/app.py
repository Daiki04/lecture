from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64
import os


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('hello.html')

@app.route("/upload", methods=["POST"])
def upload():
    data = request.json["image"]
    # Data URLをデコード
    header, encoded = data.split(",", 1)
    binary_data = base64.b64decode(encoded)

    # バイナリデータをNumPy配列に変換
    nparr = np.frombuffer(binary_data, np.uint8)

    # OpenCVを使用して画像を読み込む
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 画像を切り出す
    img = image_cutout(img)

    # 画像を保存
    cv2.imwrite("received_image.png", img)

    prediction = "ここに予測結果を表示する"
    uriImage = "data:image/png;base64," + base64.b64encode(cv2.imencode('.png', img)[1]).decode()

    return jsonify({'prediction': prediction, 'uriImage': uriImage})

def image_cutout(img):
    ### 数字(1つ)を切り出す，位置は不定，切り出しの際は余白をつけ，28x28にリサイズする
    # グレースケールに変換
    img_gr = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # 2値化
    img_bi = cv2.threshold(img_gr, 100, 255, cv2.THRESH_BINARY_INV)[1]
    # ノイズ除去
    img_bi = cv2.medianBlur(img_bi, 5)
    # 周囲を黒で囲む
    img_bi = cv2.copyMakeBorder(img_bi, 10, 10, 10, 10, cv2.BORDER_CONSTANT, value=[0, 0, 0])
    # 輪郭抽出
    contours, hierarchy = cv2.findContours(img_bi, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # 輪郭の面積を計算
    areas = list(map(cv2.contourArea, contours))
    # 面積が最大の輪郭を抽出
    cnt = [contours[np.argmax(areas)]]
    # 輪郭を囲む長方形を計算
    x, y, w, h = cv2.boundingRect(cnt[0])
    # 長方形の左上の座標を計算
    x1 = x - 10
    y1 = y - 10
    # 長方形の右下の座標を計算
    x2 = x + w + 10
    y2 = y + h + 10
    # 長方形を描画
    cv2.rectangle(img_bi, (x1, y1), (x2, y2), (0, 0, 255), 1)
    # 長方形で切り出し
    img = img_bi[y1:y2, x1:x2]
    # リサイズ
    try:
        img = cv2.resize(img, (28, 28))
    except:
        img = cv2.resize(img_bi, (28, 28))

    return img