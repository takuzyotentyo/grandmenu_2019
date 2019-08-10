from flask import Blueprint, Flask, render_template, session, redirect, url_for, flash, request


#127.0.0.1:5000/qrcode以下へアクセスした際の処理
#基本はqrコードの処理をここで行う
qr_code_api = Blueprint('app_qrcode', __name__, url_prefix='/qrcode')

@qr_code_api.route("/make")
def qr_make():
    return render_template('index.html')
