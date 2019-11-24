from flask import Blueprint, Flask, render_template, session, redirect, url_for, flash, request
from flask_sqlalchemy import SQLAlchemy

#127.0.0.1:5000/dbmanagement以下へアクセスした際の処理
#基本はDB管理の処理をここで行う

db_management_api = Blueprint('app_DBmanagement', __name__, url_prefix='/dbmanagement')

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://localhost/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# SQLAlchemyを使うことの宣言
dbmanage = SQLAlchemy(app)

#DBクラスをここに定義(変更の場合は都度ここのみ変える)
DB_CLASS1 = "stores"
DB_CLASS2 = "staffs"
DB_CLASS3 = "menus"


@db_management_api.route("/")
def DBmanagement():
    dbtablelist = [DB_CLASS1, DB_CLASS2, DB_CLASS3]
    return render_template('/dbmanagement/dbmanagement.html', dbtablelist=dbtablelist)

@db_management_api.route("/" + DB_CLASS1)
def DBmanagement_CLASS1():
    return "store情報をテーブルに格納"

@db_management_api.route("/" + DB_CLASS2)
def DBmanagement_CLASS2():
    return "staffs情報をテーブルに格納"

@db_management_api.route("/" + DB_CLASS3)
def DBmanagement_CLASS3():
    return "menus情報をテーブルに格納"
