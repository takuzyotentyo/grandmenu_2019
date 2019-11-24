#Flask関連のモジュール
from flask import Blueprint, render_template, session, redirect, url_for, flash, request, send_file, send_from_directory

#関数群ファイルの読み込み
from flaskr import FlaskAPI

#__init__.pyから設定情報を引き継ぐ
from flaskr import app
from flaskr import db

#modelの読み込み
from flaskr.models import Store, Staff, Menu, Table

import zipfile
#127.0.0.1:5000/qrcode以下へアクセスした際の処理
#基本はqrコードの処理をここで行う
qr_code_api = Blueprint('app_qrcode', __name__, url_prefix='/qrcode')


@qr_code_api.route("/generate")
def qr_generate():
    store_id = session['store_id']
    store_name = session['store_name']
    tablenum = session['table_number']
    QR_list = []
    QR_name = []
    QR_save_path = []

    for i in range(tablenum):
        QR_string = str(store_id) + "-" + str(i)
        QR_list.append(FlaskAPI.qrmaker(QR_string)[0])
        QR_name.append("qrcode_image_{}".format(QR_string))
        QR_save_path.append(FlaskAPI.qrmaker(QR_string)[1])
        #QRのZipファイル化(ここは後々関数化予定)
        #<T.B.D>Zipの名前を店名.zipのグローバル変数に持たせる
        with zipfile.ZipFile(app.config['BUF_DIR'] + "/" + "new.zip", 'w', compression=zipfile.ZIP_DEFLATED) as new_zip:
            for n in range(len(QR_save_path)):
                new_zip.write(QR_save_path[n], arcname="dir" + "/" + QR_name[n] + ".png")
    return render_template("/qrcode/zipdownload.html",
    QR_list=QR_list,
    QR_name=QR_name,
    tablenum=tablenum)  #renderで渡す値も必要ないものもあるので<T.B.D>としておく

@qr_code_api.route("/zip")
def zip_save():
    ZIP_MIMETYPE = "application/zip"
    downloadFile = "new.zip"    #<T.B.D>Zipの名前を店名.zipのグローバル変数に持たせる
    downloadPath = app.config['BUF_DIR']

    return send_from_directory(downloadPath, downloadFile, as_attachment=True, mimetype=ZIP_MIMETYPE)
#
# @app.route('/downloads/<path:filename>')
# def download_file(filename):
#     return send_from_directory('downloads',
#                                filename, as_attachment=True)
