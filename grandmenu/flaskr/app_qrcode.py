#Flask関連のモジュール
from flask import Blueprint, render_template, session, redirect, url_for, flash, request

#関数群ファイルの読み込み
from flaskr import FlaskAPI

#__init__.pyから設定情報を引き継ぐ
from flaskr import db

#modelの読み込み
from flaskr.models import Store, Staff, Menu, Table


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
    for i in range(tablenum):
        QR_string = str(store_id) + "/" + str(i)
        QR_list.append(FlaskAPI.qrmaker(QR_string))
        QR_name.append("qrcode_image_{}".format(QR_string))
    return render_template("/qrcode/output_code.html",
    QR_list=QR_list,
    QR_name=QR_name,
    tablenum=tablenum)
