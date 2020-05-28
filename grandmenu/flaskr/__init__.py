#Flask本体を読み込む
from flask import Flask
#Config設定のために必要
from flask_sqlalchemy import SQLAlchemy
import os



app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret key'
# ローカルのDBを使う場合
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://localhost/postgres"
# herokuにデプロイする場合
# app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://lfnrofxsjublyh:28fba4b4797005fcb5a60a666ff3bb038fab47e8bbfac7cefed66efcc38c5817@ec2-18-206-84-251.compute-1.amazonaws.com:5432/d8sm988s5nbbm7"
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
