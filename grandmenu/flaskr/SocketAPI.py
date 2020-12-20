from flask import session

from flaskr import socketio, db, FlaskAPI
#SQLAlchemy
from sqlalchemy import func, or_

# websocketに関するモジュール
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect, send
from datetime import datetime

#モデルの読み込み
from flaskr.models import Store, Staff, Menu, Table, Order

# オーダーのステータスごとの状況
#0はかごに入ってる,1はかごから削除された,2はオーダーされた,3は調理完了.4は料理キャンセル,5は会計依頼,6は会計完了
status_in_cart = 0
status_drop_cart = 1
status_orderd = 2
status_cooked = 3
status_cancel = 4
status_check_request = 5
status_checked = 6

# サーバー側からコネクトする処理。特に意味無し
@socketio.on('connect')
def server_to_client_connection():
	emit("server_to_client_connection","server has connected")

# カートの中身と、注文履歴を返す
@socketio.on('order_list_show')
def order_list_show():
	store_id = session['store_id']
	table_number = session['table_number']
	group_id = session['group_id']
	room = session['room']
	print("roomナンバーは")
	print(room)
	join_room(room)

	order_list = db.session.\
		query(
			Order.ORDER_ID,
			Menu.CLASS_1,
			Menu.CLASS_2,
			Menu.CLASS_3,
			Menu.PRICE,
			Order.ORDER_QUANTITY,
			Order.ORDER_STATUS
		).join(
			Order,
			Order.MENU_ID==Menu.MENU_ID
		).filter(
			Order.STORE_ID==store_id,
			Order.TABLE_NUMBER==table_number,
			Order.GROUP_ID==group_id, \
			or_(
				Order.ORDER_STATUS==status_in_cart,
				Order.ORDER_STATUS==status_orderd,
				Order.ORDER_STATUS==status_cooked,
				Order.ORDER_STATUS==status_cancel,
				Order.ORDER_STATUS==status_check_request
			)
		).all()

	emit('order_list_show', order_list)

@socketio.on('add_to_cart')
def add_to_cart(add_to_cart):
	store_id = session['store_id']
	table_number = session['table_number']
	group_id = session['group_id']
	room = session['room']
	menu_id = add_to_cart['menu_id']
	quantity = add_to_cart['quantity']
	order_timestamp = datetime.now()

	# 注文されたメニューが本当にその店のメニューかチェックする
	FlaskAPI.menu_id_check(menu_id)

	try:
		add_order = db.session.query(Order).\
			filter_by(
				STORE_ID=store_id,
				TABLE_NUMBER=table_number,
				GROUP_ID=group_id,
				ORDER_STATUS=status_in_cart,
				MENU_ID=menu_id
			).one()
		add_order.ORDER_QUANTITY = add_order.ORDER_QUANTITY + int(quantity)
		add_order.ORDER_TIMESTAMP = order_timestamp
	except:
		add_order = Order(
			STORE_ID=store_id,
			TABLE_NUMBER=table_number,
			GROUP_ID=group_id,
			ORDER_STATUS=status_in_cart,
			MENU_ID=menu_id,
			ORDER_QUANTITY=quantity,
			ORDER_TIMESTAMP=order_timestamp
		)
		db.session.add(add_order)
	db.session.commit()
	order_id = add_order.ORDER_ID
	order_menu = FlaskAPI.order_item(order_id)
	emit('order_list_show', order_menu, room=room)


@socketio.on('change_order_quantity')
def change_order_quantity(change_order_quantity):
	room = session['room']
	order_id=change_order_quantity['order_id']
	quantity=change_order_quantity['quantity']
	order_timestamp = datetime.now()

	# 注文情報が正しいか確認
	FlaskAPI.order_id_check(order_id)

	order_item = db.session.query(Order).filter_by(ORDER_ID=order_id).one()
	order_item.ORDER_QUANTITY = order_item.ORDER_QUANTITY + quantity
	# 注文数量が0の時、カートのステータスをカゴ落ち(1)に変更する
	if quantity <= 0:
		order_item.ORDER_STATUS = status_drop_cart
		order_item.ORDER_QUANTITY = 0
	else:
		order_item.ORDER_QUANTITY = quantity
	order_item.ORDER_TIMESTAMP = order_timestamp
	db.session.commit()
	db.session.close()
	order_menu=FlaskAPI.order_item(order_id)
	emit('order_list_show', order_menu, room=room)


# オーダーを飛ばす処理
@socketio.on("order_submit")
def order_submit():
	store_id=session['store_id']
	table_number=session['table_number']
	group_id = session['group_id']
	room = session['room']
	order_timestamp = datetime.now()

	db.session.query(
        Order.ORDER_STATUS,
        Order.ORDER_TIMESTAMP
    ).\
	filter_by(
        STORE_ID=store_id,
        TABLE_NUMBER=table_number,
        GROUP_ID=group_id,
        ORDER_STATUS=status_in_cart
	).update({
		Order.ORDER_STATUS: status_orderd,
		Order.ORDER_TIMESTAMP: order_timestamp
	})

	db.session.commit()
	db.session.close()

	order_list = db.session.query(
		Order.ORDER_ID,
		Menu.CLASS_1,
		Menu.CLASS_2,
		Menu.CLASS_3,
		Menu.PRICE,
		Order.ORDER_QUANTITY,
		Order.ORDER_STATUS,
		Order.TABLE_NUMBER,
	).join(
		Order, Order.MENU_ID==Menu.MENU_ID
	).filter(
		Order.STORE_ID==store_id,
		Order.TABLE_NUMBER==table_number,
		Order.GROUP_ID==group_id,
		Order.ORDER_STATUS==status_orderd,
		Order.ORDER_TIMESTAMP==order_timestamp
	).all()

	db.session.commit()
	db.session.close()

	emit("show_order", order_list, room=store_id)
	emit("cart_reset", room=room)
	emit("order_list_show", order_list, room=room)


# テーブルアクティベートの処理
@socketio.on("table_activate")
def table_activate(table_number):
	# activate_statusをDBに書き込み、クライアント側に情報を戻して、反映する
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
def kitchin_infomation():
	# 受け取ったMessageを表示
	# store_id → table_table_number → group_id → room(そのテーブルに座っている人にだけ送るチャットルームみたいなもの)の順に変数を設定していく
	store_id=session['store_id']
	# roomというチャットスペースみたいなところに入る
	join_room(store_id)
	# カートの中身を見たいので、order_status=0を設定
	order_list = db.session.query(
		Order.ORDER_ID,
		Menu.CLASS_1,
		Menu.CLASS_2,
		Menu.CLASS_3,
		Menu.PRICE,
		Order.ORDER_QUANTITY,
		Order.ORDER_STATUS,
		Order.TABLE_NUMBER,
	).join(
		Order, Order.MENU_ID==Menu.MENU_ID
	).filter(
		Order.STORE_ID==store_id,
		Order.ORDER_STATUS==status_orderd
	).all()
	emit("show_order", order_list)

@socketio.on("order_status_change")
def order_status_change(order_status_change):
	# order_status = 3は調理完了を示し、4は調理キャンセルを示す
	store_id = session['store_id']
	order_id = order_status_change['order_id']
	order_status = order_status_change['order_status']
	order_timestamp = datetime.now()
	# オーダーステータスのアップデート
	order = db.session.query(Order).filter(Order.STORE_ID==store_id,Order.ORDER_ID==order_id).one()
	if order.ORDER_STATUS <= order_status:
		order.ORDER_STATUS = order_status
	order.ORDER_TIMESTAMP = order_timestamp
	db.session.commit()
	table_number = order.TABLE_NUMBER
	group_id = order.GROUP_ID
	db.session.close()
	# roomのメンバーに情報を送信
	room = str(store_id) + '_' + str(table_number) + '_' + str(group_id)
	order_menu = FlaskAPI.order_item(order_id)
	emit("order_processing", order_id, room=store_id)
	emit("order_list_show", order_menu, room=room)

@socketio.on("check_request")
def check_request():
	store_id = session['store_id']
	table_number = session['table_number']
	group_id = group_id = session['group_id']
	room = session['room']

	# order_statusの変更
	if table_number == 0:
		order_status = status_checked
	else:
		order_status = status_check_request
	db.session.query(Order).filter(
		Order.STORE_ID==store_id,
		Order.TABLE_NUMBER==table_number,
		Order.GROUP_ID==group_id,
		or_(
			Order.ORDER_STATUS==status_orderd,
			Order.ORDER_STATUS==status_cooked
		)
	).update({Order.ORDER_STATUS: order_status})

	db.session.query(Order).filter(
		Order.STORE_ID==store_id,
		Order.TABLE_NUMBER==table_number,
		Order.GROUP_ID==group_id,
		Order.ORDER_STATUS==0
	).update({Order.ORDER_STATUS: status_drop_cart})

	db.session.query(Table).filter(
		Table.STORE_ID==store_id,
		Table.TABLE_NUMBER==table_number
	).update({Table.TABLE_ACTIVATE: 2})

	db.session.commit()
	db.session.close()

	# 合計金額を算出するための要素を抽出
	total_element = db.session.query(
		Menu.PRICE,
		Order.ORDER_QUANTITY
	).join(
		Order,
		Order.MENU_ID==Menu.MENU_ID
	).filter(
		Order.STORE_ID==store_id,
		Order.TABLE_NUMBER==table_number,
		Order.GROUP_ID==group_id,
		Order.ORDER_STATUS==status_check_request,
	).all()

	total_fee = 0
	for i in range(0, len(total_element)):
		price = total_element[i][0]
		order_quantity = total_element[i][1]
		total_fee = total_fee + price*order_quantity
	db.session.query(Table).filter(
		Table.STORE_ID==store_id,
		Table.TABLE_NUMBER==table_number
	).update({Table.TOTAL_FEE: total_fee})
	db.session.commit()
	db.session.close()
	emit('check_request', total_fee, room=room)
	emit('check_request_for_kitchin', {'table_number': table_number, 'total_fee': total_fee}, room=store_id)

@socketio.on("checkout")
def check__submit_for_kitchin(table_number):
	store_id = session['store_id']
	table_number = table_number['table_number']
	group_id = FlaskAPI.group_id_for_kitchin(table_number)
	db.session.query(Order).filter(Order.STORE_ID==store_id, Order.TABLE_NUMBER==table_number, Order.GROUP_ID==group_id, Order.ORDER_STATUS==status_check_request).update({Order.ORDER_STATUS: status_checked})
	db.session.query(Order).filter(Order.STORE_ID==store_id, Order.TABLE_NUMBER==table_number, Order.GROUP_ID==group_id, or_(Order.ORDER_STATUS==status_orderd, Order.ORDER_STATUS==status_cooked)).update({Order.ORDER_STATUS: status_checked})
	db.session.query(Table).filter(Table.STORE_ID==store_id, Table.TABLE_NUMBER==table_number).update({Table.TABLE_ACTIVATE:0, Table.ONE_TIME_PASSWORD: None, Table.TOTAL_FEE: None})
	db.session.commit()
	emit("checkout", {'table_number': table_number}, room=store_id)


@socketio.on("reload")
def reload():
	emit("reload",'reload')
