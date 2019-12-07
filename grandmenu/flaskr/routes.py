#Flask関連のモジュール
from flask import render_template, session, redirect, url_for, flash, request, jsonify

#__init__.pyから設定情報を引き継ぐ
from flaskr import app
from flaskr import db

#modelの読み込み
from flaskr.models import Store, Staff, Menu, Table, Order

#関数群ファイルの読み込み
from flaskr import FlaskAPI

# このファイルで必要なモジュール
from sqlalchemy.orm.exc import NoResultFound
import os

#sqlalchemyでfuncを使う(maxやminなどが使えるようになる)
from sqlalchemy import func

@app.route('/')
def index():

    if 'store_id' not in session:
        return redirect('/logout')
    else:
        try:
            store_id = session['store_id']
            store_name = db.session.query(Store.STORE_NAME).filter(Store.STORE_ID==store_id, Store.STORE_NAME != "", Store.TABLES != None).one()
            return render_template('index.html',store_name=store_name)
        except:
            return redirect('/store_setting')

    # return redirect('/store_setting')

#会員情報を登録
@app.route('/create_account', methods = ['POST', 'GET'])
def create_account():

    if request.method == 'POST':
        session.clear()     #エラーのセッションなどを持っている可能性があるので、クリアしている
        e_mail = request.form['e_mail']
        password = FlaskAPI.hash_password(request.form['password'])
# メールアドレスとパスワードが両方ある場合既に登録されているので、.one()がエラーを吐きexceptに飛ぶ。(.first()だとエラーにならないので注意)
        try:
            double_create_check = db.session.query(Staff).filter(Staff.E_MAIL==e_mail, Staff.PASSWORD!="").one()
            print(double_create_check.E_MAIL + "は既に存在しています")
            session['error'] = "そのメールアドレスは使用できません"
            return render_template('login.html')
        except NoResultFound as ex:
            print(ex)
# メールアドレスは存在するが、パスワードが存在しない場合、招待されているので、tryで処理する。(STAFF_CLASSは招待時に付与される想定)
            try:
                db.session.query(Staff).filter(Staff.E_MAIL==e_mail, Staff.PASSWORD=="").one()
                db.session.add(Staff(E_MAIL=e_mail, PASSWORD=password))
                db.session.commit()
                db.session.close()
                return render_template('error_1.html')
# 上記2パターン以外の場合、純粋な新規登録なので下記で処理
            except:
                db.session.add(Staff(E_MAIL=e_mail, PASSWORD=password, STAFF_CLASS_ID=1, STAFF_CLASS="Representative")) #代表者として登録。その際のIDは1とする。
                store_create=db.session.query(Staff).filter(Staff.E_MAIL==e_mail).one() #登録した代表者のレコードを抽出
                store_create.STORE_ID = store_create.STAFF_ID
                store_id=store_create.STAFF_ID  #登録した代表者のSTAFF_IDを取得
                db.session.add(Store(STORE_ID=store_id))    #代表者が登録された場合、新しいお店としてstoresテーブルに登録
                db.session.commit()
                db.session.close()
            return redirect("/login")
    else:
        return redirect("/login")



# ログイン
@app.route("/login", methods = ['POST', 'GET'])
def login():

    if request.method == 'POST':
        session.clear()     #エラーのセッションなどを持っている可能性があるので、クリアしている
        e_mail = request.form['e_mail']
        password = request.form['password']
# メールアドレスが合致しているかで、アカウントがあるかを確認
        try:
            login_user = db.session.query(Staff).filter(Staff.E_MAIL==e_mail).one()
            login_check = FlaskAPI.verify_password(login_user.PASSWORD, password)
            if login_check == True:
                #パスワードOKの処理
                session['logged_in'] = True
                session['store_id'] = login_user.STORE_ID
                session['staff_id'] = login_user.STAFF_ID
                store_info = db.session.query(Store).filter(Store.STORE_ID==login_user.STORE_ID).one()
                session['store_name'] = store_info.STORE_NAME
                session['table_number'] = store_info.TABLES
                username_session = login_user.STORE_ID#デバック用

                #bufへ店舗専用のディレクトリを作成する(初回ログインのみ)
                store_dir_path = app.config['BUF_DIR'] + "/" + str(login_user.STORE_ID)
                if (os.path.isdir(store_dir_path) == False):
                    os.makedirs(store_dir_path)
                    print("{} is CREATE".format(store_dir_path))

                return redirect('/')
            else:
                #パスワードNGの処理
                session['error'] = "メールアドレスもしくはパスワードが間違っています"
                return render_template('login.html')
        except:
            session['error'] = "メールアドレスもしくはパスワードが間違っています"   #この処理はアカウントが存在しない場合に起こるが、エラー文を変えるとリスクがあるので、パスワードエラーと同一の文章にしている
            return render_template('login.html')
    else:
        return render_template('login.html')



# 店舗名登録
@app.route('/store_information_add', methods = ['POST', 'GET'])
def store_information_add():
    if request.method == 'POST':
        store_id = session['store_id'] #セッションで登録する店舗を確認する
        store_name = request.form['store_name']
        tables = request.form['tables']
        try:
            store_information = db.session.query(Store).filter(Store.STORE_ID==store_id).one() #存在しない場合はログアウトの処理
            store_information.STORE_NAME = store_name
            store_information.TABLES = tables
            db.session.query(Table).filter(Table.STORE_ID==store_id).delete()
            for i in range(1,int(tables)+1):
                db.session.add(Table(STORE_ID=store_id, TABLE_NUMBER=i, TABLE_ACTIVATE="0"))
            db.session.commit()
            db.session.close()
            return redirect('/')
        except:
            return redirect('/logout')
    else:
        return "rendering 「/store_information_add」 error!"



# メニューリスト表示
@app.route('/show_menu' , methods = ['POST', 'GET'])
def show_menu():
    if 'store_id' not in session:
        return redirect("/logtout")
    else:
        store_id = session['store_id']
        class_2 = db.session.query(Menu.CLASS_1_ID, Menu.CLASS_2_ID, Menu.CLASS_2).filter(Menu.STORE_ID==store_id).\
            group_by(Menu.CLASS_1_ID, Menu.CLASS_2_ID, Menu.CLASS_2).\
            order_by(Menu.CLASS_2_ID).\
            all()
        print(class_2)
        class_3 = db.session.query(Menu.MENU_ID, Menu.CLASS_1_ID, Menu.CLASS_2_ID, Menu.CLASS_3_ID, Menu.CLASS_3, Menu.PRICE).filter(Menu.STORE_ID==store_id).\
            order_by(Menu.CLASS_3_ID).\
            all()
        print(class_3)
        return render_template('show_menu.html',class_2=class_2, class_3=class_3)



# メニュー登録
@app.route('/create_menu', methods = ['POST', 'GET'])
def create_menu():
    if request.method == 'POST':
        store_id = session['store_id']
        staff_id = session['staff_id']
        class_1 = request.form['class_1']
        class_2 = request.form['class_2']
        class_3 = request.form['class_3']
        price = request.form['price']
# 大分類の判定
        if class_1 == "food":
            class_1_id = 0
        else:
            class_1_id = 1

# 中分類が重複しているか判定し、IDを決定
        class_2_id_max = db.session.query(Menu.CLASS_2_ID).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==class_1_id).order_by(Menu.CLASS_2_ID.desc()).first()    #初めての中分類だった場合のCLASS_2_IDを取得するために必要な処理で、既存のCLASS_2_IDが何番まで振られているかを取得する(なければNoneが返り値)
        class_2_id_check = db.session.query(Menu.CLASS_2_ID).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==class_1_id, Menu.CLASS_2==class_2).first()    #登録内容と同一の中分類があれば、そのCLASS_2_IDを取得(なければNoneが返り値)
# 値がない場合は「None」を使う。その際の比較は「==」ではなく「is」のほうが良い
        if class_2_id_max is None and class_2_id_check is None:
            print("初めてのメニュー登録です")
            class_2_id = 1
            print("class_2_idは")
            print(class_2_id)
            print("です")
        elif class_2_id_check is None:
            print("同じ中分類はありませんでした")
            print("class_2_idは")
            class_2_id = class_2_id_max[0] +1
            print(class_2_id)
            print("です")
        else:
            print("同じ中分類がありました")
            class_2_id = class_2_id_check
            print("class_2_idは")
            print(class_2_id)
            print("です")
# 小分類のID決定
        class_3_id_max = db.session.query(Menu.CLASS_3_ID).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==class_1_id, Menu.CLASS_2_ID==class_2_id).order_by(Menu.CLASS_3_ID.desc()).first()
        class_3_id_check = db.session.query(Menu.CLASS_3_ID).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==class_1_id, Menu.CLASS_2_ID==class_2_id, Menu.CLASS_3==class_3).first()
        if class_3_id_max is None and class_3_id_check is None:
            print("初めての中分類のメニューです")
            class_3_id = 1
        elif class_3_id_check is None:
            print("同じメニューはありませんでした")
            class_3_id = class_3_id_max[0] +1
            print("class_3_idは")
            print(class_3_id)
            print("です")
        else:
            print("同じメニューがありました")
            return redirect('/show_menu')
        db.session.add(Menu(STORE_ID=store_id, STAFF_ID=staff_id, CLASS_1_ID=class_1_id, CLASS_1=class_1, CLASS_2_ID=class_2_id, CLASS_2=class_2, CLASS_3_ID=class_3_id, CLASS_3=class_3, PRICE=price))
        db.session.commit()
        db.session.close()
    return redirect("/show_menu")



# メニュー削除
@app.route('/delete_menu' , methods = ['POST', 'GET'])
def delete_menu():
    if request.method == 'POST':
        store_id = session['store_id']
        menu_ids = request.form.getlist("menu_id")
        print("消すmenu_idsは")
        print(menu_ids)
        print(len(menu_ids))
        try:
            for i in range(len(menu_ids)):
                db.session.query(Menu).filter(Menu.STORE_ID==store_id, Menu.MENU_ID==menu_ids[i]).delete()  #store_idでもフィルターをかける事により、他人のメニューを削除することを阻止
                db.session.commit()
                db.session.close()
            return redirect("/show_menu")
        except:
            return redirect("/logout")

    return redirect("/show_menu")


@app.route('/sort_menu' , methods = ['POST', 'GET'])
def sort_menu():
    if request.method == 'POST':
        store_id = session['store_id']
        staff_id = session['staff_id']
        class_2_sort_result_food = request.form.getlist("class_2_sort_result_food")     #CLASS_1_ID,CLASS_2_ID,CLASS_2の順番で並んだ文字列を受け取る
        class_2_sort_result_drink = request.form.getlist("class_2_sort_result_drink")   #CLASS_1_ID,CLASS_2_ID,CLASS_2の順番で並んだ文字列を受け取る
        class_3_sort_result = request.form.getlist("class_3_sort_result")               #MENU_ID,CLASS_1_ID,CLASS_2_ID,CLASS_3_IDの順番で並んだ文字列を受け取る

        try:
            #受け取った文字列からリストを作成
            class_3_sort_result_list = class_3_sort_result[0].split(",")
            #CLASS_3から書き換え。理由は、クラス2を先に書き換えるとメニューの追跡が煩雑になるから
            #CLASS_3_IDを一旦全て0にする
            class_3_ids = db.session.query(Menu)
            class_3_ids = db.session.query(Menu).filter(Menu.STORE_ID==store_id).update({Menu.CLASS_3_ID: 0})
            for i in range(0, len(class_3_sort_result_list), 4):
                class_3_change_menu_id = class_3_sort_result_list[i]
                class_3_change_class_1_id = class_3_sort_result_list[i+1]
                class_3_change_class_2_id = class_3_sort_result_list[i+2]
                class_3_change_record = db.session.query(Menu).filter(Menu.STORE_ID==store_id, Menu.MENU_ID==class_3_change_menu_id).one()  #store_idが合致していない場合は弾く

                class_3_change_class_3_id = db.session.query(Menu.CLASS_3_ID).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==class_3_change_class_1_id, Menu.CLASS_2_ID==class_3_change_class_2_id).order_by(Menu.CLASS_3_ID.desc()).first()
                class_3_change_record.CLASS_3_ID = class_3_change_class_3_id[0] + 1
                class_3_change_record.STAFF_ID = staff_id

            # foodかdrink片方だけ登録されている場合、ソートするとエラーが出るのをifで回避
            if(class_2_sort_result_food[0]!=""):
                #受け取った文字列からリストを作成
                class_2_sort_result_food_list = class_2_sort_result_food[0].split(",")
                # 一旦foodのCLASS_2_IDを0にする
                class_2_food_ids = db.session.query(Menu)
                class_2_food_ids = db.session.query(Menu).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==0).update({Menu.CLASS_2_ID: 0})
                #foodのCLASS_2_IDを書き換え(forが0から始まるのはlistが0から始まるから)
                for i in range(0, len(class_2_sort_result_food_list), 3):
                    class_2_id_change = db.session.query(Menu)
                    class_2_id_change = db.session.query(Menu).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==class_2_sort_result_food_list[i], Menu.CLASS_2==class_2_sort_result_food_list[i+2]).update({Menu.CLASS_2_ID: i/3+1})

            # foodかdrink片方だけ登録されている場合、ソートするとエラーが出るのをifで回避
            if(class_2_sort_result_drink[0]!=""):
                #受け取った文字列からリストを作成
                class_2_sort_result_drink_list = class_2_sort_result_drink[0].split(",")
                # 一旦drinkのCLASS_2_IDを0にする
                class_2_drink_ids = db.session.query(Menu)
                class_2_drink_ids = db.session.query(Menu).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==1).update({Menu.CLASS_2_ID: 0})
                #drinkのCLASS_2_IDを書き換え(forが0から始まるのはlistが0から始まるから)
                for i in range(0, len(class_2_sort_result_drink_list), 3):
                    class_2_id_change = db.session.query(Menu)
                    class_2_id_change = db.session.query(Menu).filter(Menu.STORE_ID==store_id, Menu.CLASS_1_ID==class_2_sort_result_drink_list[i], Menu.CLASS_2==class_2_sort_result_drink_list[i+2]).update({Menu.CLASS_2_ID: i/3+1})

            db.session.commit()
            db.session.close()

        except:
            return redirect("/logout")
    return redirect("/show_menu")

# オーダーをカートに追加する処理
# ajaxで送られてくる情報はmenu_id,quantityの並び
@app.route('/add_to_cart_json', methods = ['POST'])
def add_to_cart_json():
    try:
        store_id = session['store_id']
        # jsonを受け取る
        add_order = request.get_json()
        # dict型からvalueのみを取得
        add_order_val = list(add_order.values())
        # list型に変換したものの[0]を取り出し、splitで分割
        add_order_list = add_order_val[0].split(",")
        print(add_order_list)

        # カートに加えられるアイテムが正しいか判定
        db.session.query(Menu.STORE_ID).filter(\
            Menu.MENU_ID == add_order_list[1],\
            ).one() == store_id

        # エンドユーザーであればtable_idを持っているはず。持ってない≒店側なので、下記で処理する。
        if 'table_id' not in session:
            table_id = 0
        else:
            table_id = session['table_id']

        #order_status=0はかごに入ってる状態を示す
        order_status = 0
        print("ここまでOK")
        # Order.ORDER_STATUS==3(会計完了)のGROUP_IDの最大値を取得する
        group_id_max = db.session.query(func.max(Order.GROUP_ID)).filter(Order.STORE_ID==store_id, Order.TABLE_ID==table_id, Order.ORDER_STATUS==3).first()
        print(type(group_id_max))
        print(group_id_max)
        # group_id_maxに対して+1した数字が現在のGROUP_ID
        # group_id_maxが何故かリストで取得されるので、None若しくは数値が格納されている[0]に対してif文使用
        if group_id_max[0] is None:
            group_id = 1
        else:
            group_id = int(group_id_max[0]) + 1
        print("group_idは")
        print(group_id)

        menu_id = add_order_list[0]
        order_quantity = add_order_list[1]
        # 既にオーダーされている種類であれば数量追加、なければ新規登録
        try:
            existing_order = db.session.query(Order).filter(Order.STORE_ID==store_id, Order.TABLE_ID==table_id,  Order.GROUP_ID==group_id, Order.ORDER_STATUS==0, Order.MENU_ID==menu_id).one()
            existing_order.ORDER_QUANTITY = existing_order.ORDER_QUANTITY + int(order_quantity)
            db.session.commit()
            db.session.close()
        except:
            db.session.add(Order(ORDER_STATUS=order_status, STORE_ID=store_id, TABLE_ID=table_id, GROUP_ID=group_id, MENU_ID=menu_id, ORDER_QUANTITY=order_quantity))
            db.session.commit()
            db.session.close()

        total_quantity_list = db.session.query(func.sum(Order.ORDER_QUANTITY)).\
        filter(Order.STORE_ID==store_id, Order.TABLE_ID==table_id, Order.GROUP_ID==group_id, Order.ORDER_STATUS==0).\
        one()
        print(total_quantity_list[0])
        return str(total_quantity_list[0])
    except:
        return "false"

# カート内の商品を確認
@app.route('/cart_show')
def cart_show():
    store_id = session['store_id']
    if 'table_id' not in session:
        table_id = 0
    else:
        table_id = session['table_id']

    # oders = db.session.query(Order.MENU_ID, Order.CLASS_3, Order.PRICE)\
    # .filter(Order.STORE_ID == store_id, Order.TABLE_ID==table_id, Order.ORDER_STATUS==0).all()
    oders = db.session.query(Order.ORDER_ID, Menu.CLASS_1, Menu.CLASS_2, Menu.CLASS_3, Menu.PRICE, Order.ORDER_QUANTITY).\
    join(Order, Order.MENU_ID==Menu.MENU_ID).\
    filter(Order.STORE_ID==store_id, Order.TABLE_ID==table_id, Order.ORDER_STATUS==0).\
    all()

    print(type(oders))
    print(oders)
    # json形式で投げ返す
    return jsonify(oders)

# カート確認中に数量が増減した時の処理
# ajaxで送られてくる情報はorder_id,quantityの並び
@app.route('/change_cart_json', methods = ['POST'])
def change_cart_json():
    try:
        store_id = session['store_id']
        # jsonを受け取る
        change_order = request.get_json()
        # dict型からvalueのみを取得
        change_order_val = list(change_order.values())
        # list型に変換したものの[0]を取り出し、splitで分割
        change_order_list = change_order_val[0].split(",")
        print(change_order_list)

        order_id = int(change_order_list[0])
        order_quantity = int(change_order_list[1])
        # 変更されるアイテムが正しいか判定
        db.session.query(Order.STORE_ID).filter(Order.ORDER_ID == order_id).one() == store_id
        #order_status=0はかごに入ってる状態,1はかごから削除された状態を示す
        if order_quantity == 0:
            order_status = 1
        else:
            order_status = 0
        # 数量変更

        change_order = db.session.query(Order).filter(Order.ORDER_ID==order_id).one()
        change_order.ORDER_QUANTITY = order_quantity
        change_order.ORDER_STATUS = order_status

        db.session.commit()
        db.session.close()

        return str(order_id)
    except:
        return "false"


# テーブルのアクティベートと、注文メニューの表示
@app.route('/activate')
def activate():
    store_id = session['store_id']
    tables = db.session.query(Table.TABLE_NUMBER, Table.TABLE_ACTIVATE).filter(Table.STORE_ID == store_id).order_by(Table.TABLE_NUMBER).all()
    print(tables)
    return render_template('activate.html', tables=tables)


@app.route('/activate_json', methods = ['POST'])
def activate_json():
    try:
        store_id = session['store_id']
        table_status = request.get_json()
        table_number = table_status["table_number"]
        activate_status = table_status["activate_status"]
        db.session.query(Table).filter(Table.STORE_ID==store_id, Table.TABLE_NUMBER==table_number).update({Table.TABLE_ACTIVATE: activate_status})
        db.session.commit()
        db.session.close()
        result="true"
        return result
    except:
        result="false"
        return result

@app.route('/store_setting')
def store_setting():
    if 'store_id' not in session:
        return redirect('/logout')
    else:
        try:
            store_id = session['store_id']
            store_name = db.session.query(Store.STORE_NAME, Store.TABLES).filter(Store.STORE_ID==store_id, Store.STORE_NAME !="").one()
            return render_template('store_setting.html',store_name=store_name)
        except:
            return render_template('store_setting.html', store_name="")

@app.route('/revise_menu')
def revise_menu():
    return "未実装"

@app.route("/logout")
def logout():
    # session['logged_in'] = False
    session.clear()
    return render_template('login.html')


# QRコードから復元する際のテスト
@app.route("/test/<int:store_id>/<int:table_number>")
def test(store_id,table_number):
    print(store_id)
    print(table_number)
    session.clear()
    session['store_id'] = store_id
    session['table_number'] = table_number
    return redirect("/order")
# ここまで

# スマホで注文を飛ばす処理
@app.route("/order")
def order():
    store_id = session['store_id']
    table_number = session['table_number']
    class_2 = db.session.query(Menu.CLASS_1_ID, Menu.CLASS_2_ID, Menu.CLASS_2).filter(Menu.STORE_ID==store_id).\
        group_by(Menu.CLASS_1_ID, Menu.CLASS_2_ID, Menu.CLASS_2).\
        order_by(Menu.CLASS_2_ID).\
        all()
    print(class_2)
    class_3 = db.session.query(Menu.MENU_ID, Menu.CLASS_1_ID, Menu.CLASS_2_ID, Menu.CLASS_3_ID, Menu.CLASS_3, Menu.PRICE).filter(Menu.STORE_ID==store_id).\
        order_by(Menu.CLASS_3_ID).\
        all()
    print(class_3)
    return render_template('order.html',class_2=class_2, class_3=class_3)
# ここまで
