#Flask本体を読み込む
from flask import Flask
#Config設定のために必要
from flask_sqlalchemy import SQLAlchemy



app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret key'
# ローカルのDBを使う場合
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://localhost/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


#他のモジュールをレンダリングするために必要
from flaskr.app_qrcode import qr_code_api  #QRコード関連のモジュール
#他モジュール(.py)から呼び出す
app.register_blueprint(qr_code_api)

#設定反映後に読み込む
from flaskr import routes
