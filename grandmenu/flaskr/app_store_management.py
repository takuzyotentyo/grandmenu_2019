#Flask関連のモジュール
from flask import Blueprint, render_template, session, redirect, url_for, flash, request
#関数群ファイルの読み込み
from flaskr import FlaskAPI

#__init__.pyから設定情報を引き継ぐ
from flaskr import app
from flaskr import db

#modelの読み込み
from flaskr.models import Store, Staff, Menu, Table, Order
#127.0.0.1:5000/store_management以下へアクセスした際の処理
store_management_api = Blueprint('app_store_management', __name__, url_prefix='/store_management')

@store_management_api.route("/period_sales_data")
def period_sales_data(data):
	print('OK')
	store_id = session['store_id']
	#DBクエリの発行により情報を格納する
	menu_info = db.session.query(Menu.MENU_ID, Menu.CLASS_1_ID, Menu.CLASS_2_ID, Menu.CLASS_3_ID, MenuCLASS_3, Menu.PRICE).filter(Store.STORE_ID==store_id).all()
	len = menu_info.length()
	db.session.close()
	return len