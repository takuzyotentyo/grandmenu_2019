from flask import session

from flaskr import socketio, db, FlaskAPI
#SQLAlchemy
from sqlalchemy import func, or_

# websocketに関するモジュール
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect, send

#モデルの読み込み
from flaskr.models import Store, Staff, Menu, Table, Order

# クライアント側と繋がった場合に、注文中のメニューと、注文履歴を返す
@socketio.on('cart')
def cart(cart):
	# store_id, table_number, group_idを設定
	store_id = session['store_id']
	table_number = session['table_number']
	group_id = FlaskAPI.group_id()
	# sessionをwebsocket上で持たせてもクライアントと共有できないため、都度設定
	room = str(session['store_id']) + '_' + str(session['table_number']) + '_' + str(session['group_id'])
	if cart['action'] == 'show':
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
			db.session.commit()
			db.session.close()
			total_quantity=FlaskAPI.total_quantity()
			order_list=FlaskAPI.order_item(order_id)
			emit('cart',{'action':'change', 'total_quantity': total_quantity, 'order_list': order_list}, room=room)

# サーバー側からもコネクトする処理。特に意味無し
@socketio.on('connect')
def server_to_client_connection():
	emit("server_to_client_connection","server has connected")

# オーダーを飛ばす処理
@socketio.on("order_submit")
def order_submit():
	store_id=session['store_id']
	table_number=session['table_number']
	group_id = FlaskAPI.group_id()
	room = str(session['store_id']) + '_' + str(session['table_number']) + '_' + str(session['group_id'])

	order_status=0
	order_list=FlaskAPI.order_item_for_kitchin(store_id, table_number, group_id, order_status)
	order_history = db.session.query(Order.ORDER_ID, Menu.CLASS_1, Menu.CLASS_2, Menu.CLASS_3, Menu.PRICE, Order.ORDER_QUANTITY, Order.ORDER_STATUS).\
			join(Order, Order.MENU_ID==Menu.MENU_ID).\
			filter(Order.STORE_ID==store_id, Order.TABLE_NUMBER==table_number, Order.GROUP_ID==group_id, Order.ORDER_STATUS==0).\
			all()

	order_status=2
	order_timestamp = datetime.now()
	orders=db.session.query(Order).filter_by(STORE_ID=store_id, TABLE_NUMBER=table_number, GROUP_ID=group_id, ORDER_STATUS=0).update({Order.ORDER_STATUS: order_status, Order.ORDER_TIMESTAMP: order_timestamp})
	db.session.commit()
	db.session.close()

	emit("show_order", {'action':'add', 'order_list':order_list}, room=store_id)
	emit("cart", {'action':'submit', 'total_quantity': 0, 'order_list': []}, room=room)
	emit("order_history",{'action': 'add', 'order_history': order_history}, room=room)

# テーブルアクティベートの処理
@socketio.on("table_activate")
def table_activate(table_number):
	# activate_statusをDBに書き込み、クライアント側に情報を戻して、反映する
	# try:
	store_id = session['store_id']
	table_number = table_number["table_number"]
	activate_status_befor = db.session.query(Table.TABLE_ACTIVATE).\
		filter(Table.STORE_ID==store_id, Table.TABLE_NUMBER==table_number).\
		scalar()
	type(activate_status_befor)
	if activate_status_befor == 0:
		while True:
			one_time_password = FlaskAPI.one_time_password()
			# one_time_password = 'pKZEohKSoF2lDaWv' わざと無限ループを起こす場合に使用
			one_time_password_exists = db.session.query(Table.ONE_TIME_PASSWORD).\
				filter(Table.ONE_TIME_PASSWORD==one_time_password).\
				scalar()
			if one_time_password != one_time_password_exists:
				activate_status_after = 1
				break
	else:
		one_time_password = None
		activate_status_after = 0

	db.session.query(Table).\
		filter(Table.STORE_ID==store_id, Table.TABLE_NUMBER==table_number).\
		update({Table.TABLE_ACTIVATE: activate_status_after, Table.ONE_TIME_PASSWORD: one_time_password})
	db.session.commit()
	db.session.close()
	table_information = {
		'table_number': table_number,
		'activate_status': activate_status_after,
		'one_time_password': one_time_password
	}
	emit("table_activate", table_information, room=store_id)
	emit("table_activate_origin", table_information)

# 店舗側がオーダーを確認する仕組み
@socketio.on("kitchin_infomation")
def kitchin_infomation(msg):
	# 受け取ったMessageを表示
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
	order = db.session.query(Order).filter(Order.STORE_ID==store_id,Order.ORDER_ID==order_id).one()
	if order.ORDER_STATUS <= order_status:
		order.ORDER_STATUS = order_status
	db.session.commit()
	table_number = order.TABLE_NUMBER
	group_id = order.GROUP_ID
	db.session.close()
	room = str(store_id) + '_' + str(table_number) + '_' + str(group_id)
	# roomのメンバーに情報を送信
	emit("order_check",order_id, room=store_id)
	emit("order_history",{'action':'change', 'order_id': order_id, 'order_status': order_status}, room=room)

@socketio.on("checkout")
def order_check():
	store_id = session['store_id']
	table_number = session['table_number']
	group_id = FlaskAPI.group_id()
	room = str(session['store_id']) + '_' + str(session['table_number']) + '_' + str(session['group_id'])
	db.session.query(Order).filter(Order.STORE_ID==store_id, Order.TABLE_NUMBER==table_number, Order.GROUP_ID==group_id, or_(Order.ORDER_STATUS==2, Order.ORDER_STATUS==3)).update({Order.ORDER_STATUS: 5})
	db.session.query(Order).filter(Order.STORE_ID==store_id, Order.TABLE_NUMBER==table_number, Order.GROUP_ID==group_id, Order.ORDER_STATUS==0).update({Order.ORDER_STATUS: 1})
	db.session.query(Table).filter(Table.STORE_ID==store_id, Table.TABLE_NUMBER==table_number).update({Table.TABLE_ACTIVATE: 2})
	db.session.commit()
	total_element = db.session.query(Menu.PRICE, Order.ORDER_QUANTITY).\
		join(Order, Order.MENU_ID==Menu.MENU_ID).\
		filter_by(STORE_ID=store_id, TABLE_NUMBER=table_number, GROUP_ID=group_id, ORDER_STATUS=5).\
		all()
	db.session.close()
	total_fee = 0
	for i in range(0, len(total_element)):
		price = total_element[i][0]
		order_quantity = total_element[i][1]
		total_fee = total_fee + price*order_quantity
	db.session.query(Table).filter(Table.STORE_ID==store_id, Table.TABLE_NUMBER==table_number).update({Table.TOTAL_FEE: total_fee})
	db.session.commit()
	db.session.close()
	emit('checkout', total_fee, room=room)
	emit('checkout_for_kitchin', {'table_number': table_number, 'total_fee': total_fee}, room=store_id)

@socketio.on("check__submit_for_kitchin_receive")
def check__submit_for_kitchin(table_number):
	store_id = session['store_id']
	table_number = table_number['table_number']
	group_id = FlaskAPI.group_id_for_kitchin(table_number)
	db.session.query(Order).filter(Order.STORE_ID==store_id, Order.TABLE_NUMBER==table_number, Order.GROUP_ID==group_id, Order.ORDER_STATUS==5).update({Order.ORDER_STATUS: 6})
	db.session.query(Table).filter(Table.STORE_ID==store_id, Table.TABLE_NUMBER==table_number).update({Table.TABLE_ACTIVATE:0, Table.ONE_TIME_PASSWORD: None, Table.TOTAL_FEE: None})
	db.session.commit()
	emit("check__submit_for_kitchin_receive", {'table_number': table_number}, room=store_id)


@socketio.on("reload")
def reload():
	emit("reload",'reload')
