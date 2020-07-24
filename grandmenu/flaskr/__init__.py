#Flask本体を読み込む
from flask import Flask, session

#Config設定のために必要
from flask_sqlalchemy import SQLAlchemy
import os

#SQLAlchemy
from sqlalchemy import func, or_

#admin管理
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

# websocketに関するモジュール
from flask_socketio import SocketIO

import gevent
from gevent import monkey
monkey.patch_all()

#メール設定
from flask_mail import Mail

#Flaskの名前空間作成
app = Flask(__name__)

#-----config設定---S
app.config['SECRET_KEY'] = 'secret key'
# ローカルのDBを使う場合
# app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://localhost/postgres"
# herokuにデプロイする場合
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://usfickigphzvkl:802409304691e9b47446d43ba32186d5bbabe773b0bb4924456a1d0822d85722@ec2-34-202-7-83.compute-1.amazonaws.com:5432/d9u1uh5633538t"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#bufディレクトリの設定
app.config['BUF_DIR'] = os.path.dirname(os.path.abspath(__file__)) + "/buf"
#static/imgディレクトリの設定
app.config['IMG_DIR'] = os.path.dirname(os.path.abspath(__file__)) + "/static/img"
#static/fontsディレクトリの設定
app.config['FONTS_DIR'] = os.path.dirname(os.path.abspath(__file__)) + "/static/fonts"
#-----config設定---E

#データベースの名前空間作成
db = SQLAlchemy(app)

#モデルの読み込み
from flaskr.models import Store, Staff, Menu, Table, Order, RegistrationState

#blueprint読み込み---S
#他のモジュールをレンダリングするために必要
from flaskr.app_qrcode import qr_code_api  #QRコード関連のモジュール
from flaskr.app_sales_management import sales_management_api
#他モジュール(.py)から呼び出す
app.register_blueprint(qr_code_api)
app.register_blueprint(sales_management_api)
#blueprint読み込み---E

#管理画面admin情報
admin = Admin(app)
admin.add_view(ModelView(Store, db.session))
admin.add_view(ModelView(Staff, db.session))
admin.add_view(ModelView(Menu, db.session))
admin.add_view(ModelView(Table, db.session))
admin.add_view(ModelView(Order, db.session))
admin.add_view(ModelView(RegistrationState, db.session))


#メールの名前空間作成
mail = Mail(app)

async_mode='gevent'
# websocketは、socketio.run(app, debug=True)で動くため(本ファイル最下部参照)、run.pyに書く(いい方法があったら書き直す)
socketio=SocketIO(app, async_mode=async_mode, manage_session=False)


#設定反映後に読み込む
from flaskr import routes, SocketAPI
# from flaskr import routes_test, SocketAPI_test
