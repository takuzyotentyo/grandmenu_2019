from flask import Blueprint, Flask, render_template, session, redirect, url_for, flash, request
import qrcode as qr
import base64
from io import BytesIO
from PIL import Image

#デバッグ用モジュールのimport
from datetime import datetime


#127.0.0.1:5000/qrcode以下へアクセスした際の処理
#基本はqrコードの処理をここで行う
qr_code_api = Blueprint('app_qrcode', __name__, url_prefix='/qrcode')

#クラス定義 QRコード情報
#デバッグ1-OFF-S
# qr = qr.QRCode(
#     version=2,  #version : 1~40 を指定、大きければ納める情報量が多くできる
#                 #https://www.qrcode.com/about/version.html
#     error_correction=qr.constants.ERROR_CORRECT_M,  #L,M,Q,H 誤り訂正レベル
#     box_size=8, #画像サイズ
#     border=2,   #QRの余白部分
# )
#デバッグ1-OFF-E

@qr_code_api.route("/make")
def qr_make():
    now = datetime.now()
    timeString = now.strftime(str("%Y-%m-%d %H:%M"))

    qr_b64data = qrmaker(timeString)
    qr_name = "qrcode_image_{}".format(timeString)
    return render_template("/qrcode/output_code.html",
    qr_b64data=qr_b64data,
    qr_name=qr_name
    )


# QRコードを生成する関数
def qrmaker(code):
    #デバッグ1-ON-S
    # qr.add_data(code)
    # qr.make()
    # qr_img = qr.make_image(fill_color="black", back_color="white")#色指定は#rrggbb可能
    #デバッグ1-ON-E

    #デバッグ1-OFF-S
    qr_img = qr.make(str(code))
    #デバッグ1-OFF-S

    # 画像書き込み用バッファを確保して画像データをそこに書き込む
    buf = BytesIO()
    qr_img.save(buf,format="png")

    # バイナリデータをbase64でエンコードし、それをさらにutf-8でデコードしておく
    qr_b64str = base64.b64encode(buf.getvalue()).decode("utf-8")

    # image要素のsrc属性に埋め込めこむために、適切に付帯情報を付与する
    qr_b64data = "data:image/png;base64,{}".format(qr_b64str)

    return qr_b64data
