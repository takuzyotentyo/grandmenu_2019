#Flask本体を読み込む
from flask import Flask
#Config設定のために必要
from flask_sqlalchemy import SQLAlchemy
import os



app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret key'
# ローカルのDBを使う場合
# app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://localhost/postgres"
# herokuにデプロイする場合
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://xvsejusgigycsu:35ad30fc1fb8e3f1a417bbe0da218d3dc20f725be43c63b60030b7b04354aed6@ec2-18-210-214-86.compute-1.amazonaws.com:5432/dbh6s0pfc599dl"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#bufディレクトリの設定
app.config['BUF_DIR'] = os.path.dirname(os.path.abspath(__file__)) + "/buf"
#static/imgディレクトリの設定
app.config['IMG_DIR'] = os.path.dirname(os.path.abspath(__file__)) + "/static/img"
#static/fontsディレクトリの設定
app.config['FONTS_DIR'] = os.path.dirname(os.path.abspath(__file__)) + "/static/fonts"
db = SQLAlchemy(app)


#他のモジュールをレンダリングするために必要
from flaskr.app_qrcode import qr_code_api  #QRコード関連のモジュール
#他モジュール(.py)から呼び出す
app.register_blueprint(qr_code_api)

from flaskr.app_sales_management import sales_management_api
app.register_blueprint(sales_management_api)

#設定反映後に読み込む
from flaskr import routes
