#__pycache__の自動作成が鬱陶しいので作成しないように
import sys
sys.dont_write_bytecode=True
from flask import render_template, session, redirect, url_for, flash, request, jsonify
from flaskr import app

# websocketに関するモジュール
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect, send
#modelの読み込み
from flaskr.models import Store, Staff, Menu, Table, Order
#sqlalchemyでfuncを使う(maxやminなどが使えるようになる)
from sqlalchemy import func, or_

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
#関数群ファイルの読み込み
from flaskr import FlaskAPI

db=SQLAlchemy(app)

# websocketは、socketio.run(app, debug=True)で動くため(本ファイル最下部参照)、run.pyに書く(いい方法があったら書き直す)
# async_mode...よくわからん。
socketio=SocketIO(app, async_mode=None)

# クライアント側と繋がった場合に、注文中のメニューと、注文履歴を返す
@socketio.on('cart')
def cart(cart):
	print(cart)
	# store_id, table_number, group_idを設定
	store_id = session['store_id']
	table_number = session['table_number']
	group_id = FlaskAPI.group_id()
	print('グループIDは'+str(session['group_id']))
	if cart['action'] == 'show':
		# roomをセッションに持たせる
		session['room'] = str(session['store_id']) + '_' + str(session['table_number']) + '_' + str(session['group_id'])
		session['store'] = str(session['store_id'])
		room=session['room']
		# roomというチャットスペースみたいなところに入る
		join_room(room)
		# カートに入っている商品数を求める
		total_quantity = FlaskAPI.total_quantity()
		# カートに入っている商品情報を求める
		order_status = 0
		order_list = FlaskAPI.order_list(order_status)
		order_history = db.session.query(Order.ORDER_ID, Menu.CLASS_1, Menu.CLASS_2, Menu.CLASS_3, Menu.PRICE, Order.ORDER_QUANTITY, Order.ORDER_STATUS).\
		    join(Order, Order.MENU_ID==Menu.MENU_ID).\
		    filter(Order.STORE_ID==store_id, Order.TABLE_NUMBER==table_number, Order.GROUP_ID==group_id, or_(Order.ORDER_STATUS==2, Order.ORDER_STATUS==3, Order.ORDER_STATUS==4)).\
		    all()
		# その人だけに返す
		emit('cart',{'action':'show', 'total_quantity': total_quantity, 'order_list': order_list})
		emit('order_history',{'action':'show', 'order_history': order_history})
	else:
		room = session['room']
		if cart['action'] == 'add':
			menu_id = cart['menu_id']
			order_quantity = cart['order_quantity']
			order_status = 0
			try:
				existing_order=db.session.query(Order).filter_by(STORE_ID=store_id, TABLE_NUMBER=table_number, GROUP_ID=group_id, ORDER_STATUS=order_status, MENU_ID=menu_id).one()
				existing_order.ORDER_QUANTITY=existing_order.ORDER_QUANTITY + int(order_quantity)
				db.session.commit()
				order_id = existing_order.ORDER_ID
				db.session.close()
			except:
				add_infomation = Order(STORE_ID=store_id, TABLE_NUMBER=table_number, GROUP_ID=group_id, ORDER_STATUS=order_status, MENU_ID=menu_id, ORDER_QUANTITY=order_quantity)
				db.session.add(add_infomation)
				db.session.commit()
				order_id = add_infomation.ORDER_ID
				db.session.close()
			total_quantity=FlaskAPI.total_quantity()
			order_list=FlaskAPI.order_item(order_id)
			emit('cart',{'action':'add', 'total_quantity': total_quantity, 'order_list': order_list}, room=room)
		elif cart['action'] == 'change':
			order_id=cart['order_id']
			order_quantity=cart['order_quantity']
			# カートに加えられるアイテムが正しいか判定エラーが出ればexceptに飛ばす
			order_item=db.session.query(Order).filter_by(ORDER_ID=order_id).one()
			# 注文数量が0の時、カートのステータスをカゴ落ち(1)に変更する
			if order_quantity<=0:
				order_item.ORDER_STATUS=1
			# 数量の変更
			order_item.ORDER_QUANTITY=order_quantity
			print(order_item)
			db.session.commit()
			db.session.close()
			total_quantity=FlaskAPI.total_quantity()
			order_list=FlaskAPI.order_item(order_id)
			emit('cart',{'action':'change', 'total_quantity': total_quantity, 'order_list': order_list}, room=room)

# サーバー側からもコネクトする処理。特に意味無し
@socketio.on('connect')
def server_to_client_connection():
	emit("server_to_client_connection","server has connected", broadcast=True)

# オーダーを飛ばす処理
@socketio.on("order_submit")
def order_submit():
	print("オーダー決定")
	store_id=session['store_id']
	table_number=session['table_number']
	group_id=session['group_id']
	room=session['room']

	order_status=0
	order_list=FlaskAPI.order_item_for_kitchin(store_id, table_number, group_id, order_status)
	order_history = db.session.query(Order.ORDER_ID, Menu.CLASS_1, Menu.CLASS_2, Menu.CLASS_3, Menu.PRICE, Order.ORDER_QUANTITY, Order.ORDER_STATUS).\
		    join(Order, Order.MENU_ID==Menu.MENU_ID).\
		    filter(Order.STORE_ID==store_id, Order.TABLE_NUMBER==table_number, Order.GROUP_ID==group_id, Order.ORDER_STATUS==0).\
		    all()

	order_status=2
	order_timestamp = datetime.now()
	orders=db.session.query(Order).filter_by(STORE_ID=store_id, TABLE_NUMBER=table_number, GROUP_ID=group_id, ORDER_STATUS=0).update({Order.ORDER_STATUS: order_status, Order.ORDER_TIMESTAMP: order_timestamp})
	# print("print orders")
	print(order_history)
	db.session.commit()
	db.session.close()

	print("追加のオーダーは")
	print(order_list)

	emit("show_order", {'action':'add', 'order_list':order_list}, room=store_id)
	emit("cart", {'action':'submit', 'total_quantity': 0, 'order_list': []}, room=room)
	emit("order_history",{'action': 'add', 'order_history': order_history}, room=room)

# テーブルアクティベートの処理
@socketio.on("table_activate")
def table_activate(table_information):
	# activate_statusをDBに書き込み、クライアント側に情報を戻して、反映する
    # try:
        store_id = session['store_id']
        table_number = table_information["table_number"]
        activate_status = table_information["activate_status"]
        one_time_password = table_information["one_time_password"]
        print("one_time_passwordは")
        print(table_information["one_time_password"])
        print(one_time_password)
        db.session.query(Table).filter(Table.STORE_ID==store_id, Table.TABLE_NUMBER==table_number).update({Table.TABLE_ACTIVATE: activate_status, Table.ONE_TIME_PASSWORD: one_time_password})
        db.session.commit()
        db.session.close()
        emit("table_activate", table_information, room=store_id)
    # except:
    #     result="false"
    #     emit("server_to_client_connection", "error", room=store_id)

# 店舗側がオーダーを確認する仕組み
@socketio.on("kitchin_infomation")
def kitchin_infomation(msg):
	# 受け取ったMessageを表示
	print(msg)
	# store_id → table_table_number → group_id → room(そのテーブルに座っている人にだけ送るチャットルームみたいなもの)の順に変数を設定していく
	store_id=session['store_id']
	# roomというチャットスペースみたいなところに入る
	join_room(store_id)
	# カートの中身を見たいので、order_status=0を設定
	order_status=2
	# カートに入っている商品情報を求める(order_statusの値を変更すれば、カートに入っているものや、注文済みのもの、決済が完了したものを見ることができる)
	order_list=FlaskAPI.order_list_for_kitchin(store_id, order_status)
	# roomのメンバーに情報を送信
	emit("show_order",{'action':'show', 'order_list':order_list})

@socketio.on("order_status_change")
def order_status_change(order_status_change):
	# order_status = 3は調理完了を示し、4は調理キャンセルを示す
	store_id = session['store_id']
	order_id = order_status_change['order_id']
	order_status = order_status_change['order_status']
	# オーダーステータスのアップデート
	order = db.session.query(Order).filter_by(STORE_ID=store_id,ORDER_ID=order_id).one()
	order.ORDER_STATUS = order_status
	db.session.commit()
	print('orderオブジェクトの中身は')
	print(order)
	table_number = order.TABLE_NUMBER
	group_id = order.GROUP_ID
	db.session.close()
	room = str(store_id) + '_' + str(table_number) + '_' + str(group_id)
	# roomのメンバーに情報を送信
	emit("order_check",order_id, room=store_id)
	emit("order_history",{'action':'change', 'order_id': order_id, 'order_status': order_status}, room=room)

@socketio.on("reload")
def reload():
	emit("reload")

if __name__ == '__main__':
	# app.run(debug=True)
	socketio.run(app, debug=True)
