from flask import Blueprint, Flask, render_template, session, redirect, url_for, flash, request
from flask_sqlalchemy import SQLAlchemy
import qrcode as qr
import base64
from io import BytesIO
from PIL import Image
# #app.pyをモジュールとして読み込み(そろそろDB用の別ファイルを構成しておきたい)
# from models import Staff, Menu, Table

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

@qr_code_api.route("/make_datetime")
def qr_make_datetime():
    now = datetime.now()
    timeString = now.strftime(str("%Y-%m-%d %H:%M"))

    qr_b64data = qrmaker(timeString)
    qr_name = "qrcode_image_{}".format(timeString)
    return render_template("/qrcode/output_code.html",
    qr_b64data=qr_b64data,
    qr_name=qr_name
    )

@qr_code_api.route("/generate")
def qr_generate():
    store_id = session['store_id']
    store_name = session['store_name']
    tablenum = session['table_number']
    print(store_id)
    print(tablenum)
    QR_list = []
    QR_name = []
    for i in range(tablenum):
        QR_string = str(store_id) + "/" + str(i)
        QR_list.append(qrmaker(QR_string))
        QR_name.append("qrcode_image_{}".format(QR_string))
    print(QR_list)
    print(QR_name)
    return render_template("/qrcode/output_code.html",
    QR_list=QR_list,
    QR_name=QR_name,
    tablenum=tablenum)



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
