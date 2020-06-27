#Flask関連のモジュール
from flask import Blueprint, render_template, session, redirect, url_for, flash, request, jsonify
import json
#関数群ファイルの読み込み
from flaskr import FlaskAPI
import datetime, re

#__init__.pyから設定情報を引き継ぐ
from flaskr import app, db

#modelの読み込み
from flaskr.models import Store, Staff, Menu, Table, Order
#127.0.0.1:5000/sales_management以下へアクセスした際の処理
sales_management_api = Blueprint('app_sales_management', __name__, url_prefix='/sales_management')

@sales_management_api.route("/day_sales_data", methods = ['POST'])
def day_sales_data():
	period_start = request.json['period_day']
	store_id = session['store_id']
	period_start = FlaskAPI.str_to_date(period_start)
	period_end = period_start + datetime.timedelta(days=1)
	#DBクエリの発行により情報を格納する
	order_data = db.session.query(
		Order.ORDER_ID,
		Menu.CLASS_1,
		Menu.CLASS_2,
		Menu.CLASS_3,
		Menu.PRICE,
		Order.ORDER_QUANTITY,
		Order.ORDER_STATUS,
		Order.TABLE_NUMBER,
		Order.GROUP_ID,
		Order.MENU_ID
	).\
	join(Order, Order.MENU_ID==Menu.MENU_ID).\
	filter(Order.STORE_ID==store_id, Order.ORDER_TIMESTAMP>=period_start, Order.ORDER_TIMESTAMP<period_end).\
	all()
	menu_list = db.session.query(
		Menu.MENU_ID,
		Menu.CLASS_1,
		Menu.CLASS_2,
		Menu.CLASS_3,
		Menu.PRICE
	).\
	filter(Menu.STORE_ID==store_id).\
	all()
	db.session.close()
	period = [period_start,period_end]
	data = {'order_data': order_data , 'menu_list': menu_list , 'period': period}
	return jsonify(data)

@sales_management_api.route("/period_sales_data", methods = ['POST'])
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
	order_data = db.session.query(
		Order.ORDER_ID,
		Menu.CLASS_1,
		Menu.CLASS_2,
		Menu.CLASS_3,
		Menu.PRICE,
		Order.ORDER_QUANTITY,
		Order.ORDER_STATUS,
		Order.TABLE_NUMBER,
		Order.GROUP_ID,
		Order.MENU_ID
	).\
	join(Order, Order.MENU_ID==Menu.MENU_ID).\
	filter(Order.STORE_ID==store_id, Order.ORDER_TIMESTAMP>=period_start, Order.ORDER_TIMESTAMP<period_end).\
	all()
	menu_list = db.session.query(
		Menu.MENU_ID,
		Menu.CLASS_1,
		Menu.CLASS_2,
		Menu.CLASS_3,
		Menu.PRICE
	).\
	filter(Menu.STORE_ID==store_id).\
	all()
	db.session.close()
	period = [period_start,period_end]
	data = {'order_data': order_data , 'menu_list': menu_list , 'period': period}
	return jsonify(data)
