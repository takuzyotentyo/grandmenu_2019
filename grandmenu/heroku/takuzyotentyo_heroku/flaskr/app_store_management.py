#Flask関連のモジュール
from flask import Blueprint, render_template, session, redirect, url_for, flash, request, jsonify
import json
#関数群ファイルの読み込み
from flaskr import FlaskAPI
import datetime, re

#__init__.pyから設定情報を引き継ぐ
from flaskr import app
from flaskr import db

#modelの読み込み
from flaskr.models import Store, Staff, Menu, Table, Order
#127.0.0.1:5000/store_management以下へアクセスした際の処理
store_management_api = Blueprint('app_store_management', __name__, url_prefix='/store_management')

@store_management_api.route("/day_sales_data", methods = ['POST'])
def day_sales_data():
	period_day = request.json['period_day']
	store_id = session['store_id']
	period_day = FlaskAPI.str_to_date(period_day)
	period_end = period_start + datetime.timedelta(days=1)
	#DBクエリの発行により情報を格納する
	menu_info = db.session.query(Order.ORDER_ID, Order.ORDER_TIMESTAMP, Order.ORDER_STATUS, Order.STORE_ID, Order.TABLE_NUMBER, Order.GROUP_ID, Order.MENU_ID).filter(Order.STORE_ID==store_id, Order.ORDER_TIMESTAMP>=period_start, Order.ORDER_TIMESTAMP<period_end).all()
	print(menu_info)
	my_len = str(len(menu_info))
	db.session.close()
	return my_len

@store_management_api.route("/period_sales_data", methods = ['POST'])
def period_sales_data():
	store_id = session['store_id']
	period_start = request.json['period_start']
	period_start = FlaskAPI.str_to_date(period_start)
	period_end = request.json['period_end']
	period_end = FlaskAPI.str_to_date(period_end)
	# 指定期間の始まりと終わりに逆転現象が起きていた場合に対応
	pre_start = period_start
	pre_end = period_end
	if(pre_start>=pre_end):
		period_start = pre_end
		period_end = pre_start
	period_end = period_end + datetime.timedelta(days=1)
	#DBクエリの発行により情報を格納する
	menu_info = db.session.query(Order.ORDER_ID, Order.ORDER_TIMESTAMP, Order.ORDER_STATUS, Order.STORE_ID, Order.TABLE_NUMBER, Order.GROUP_ID, Order.MENU_ID).filter(Order.STORE_ID==store_id, Order.ORDER_TIMESTAMP>=period_start, Order.ORDER_TIMESTAMP<period_end).all()
	print(menu_info)
	my_len = str(len(menu_info))
	db.session.close()
	return my_len