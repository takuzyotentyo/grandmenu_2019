#coding:utf-8

# Flaskのインポート
from flask import Flask, render_template, session, redirect, url_for, flash, request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
# psycopg2のインポート
import psycopg2

#他モジュール(.py)のインポート
from app_qrcode import qr_code_api  #QRコード関連のモジュール

#SQLAlchemy必要に応じて適宜導入
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm.exc import NoResultFound
#from sqlalchemy.ext.declarative import declarative_base
#from sqlalchemy.orm import sessionmaker



app = Flask(__name__)

#他モジュール(.py)から呼び出す
app.register_blueprint(qr_code_api)

app.config['SECRET_KEY'] = 'secret key'

#DBの向き先スイッチング
# AWSを使う場合
#app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://efyhucxwisbkfm:65bd9fb1a4769a3eb1eb533d70bd2fd2621d339b7821350f99f8e25b85656902@ec2-184-73-169-163.compute-1.amazonaws.com:5432/dbu4difidq79a9"


# ローカルのDBを使う場合
app.config['SQLALCHEMY_DATABASE_URI'] = "postgres://localhost/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# SQLAlchemyを使うことの宣言
db = SQLAlchemy(app)




# 関数エリア-Start
#ハッシュパスワードを作成する関数
def hash_password(original_pass):
    return generate_password_hash(original_pass)

#ハッシュパスワードと元のパスワードを比較する関数
def verify_password(hash_pass, original_pass):
    return check_password_hash(hash_pass, original_pass)
# 関数エリア-End

#テーブル定義
class Store(db.Model):
    __tablename__ = 'stores'

    STORE_ID = db.Column(Integer, primary_key=True) # ≒代表者のSTAFF_ID
    STORE_NAME = db.Column(String(255))

    def __repr__(self):
        return "(STORE_ID='%s', STORE_NAME='%s')" % (self.STORE_ID, self.STORE_NAME)

class Staff(db.Model):
    __tablename__ = 'staffs'

    STAFF_ID = db.Column(Integer, primary_key=True)
    STORE_ID = db.Column(Integer)
    STAFF_NUMBER = db.Column(Integer)   #スタッフ順の並べ替えの際に必要
    STAFF_NAME = db.Column(String(255))
    E_MAIL = db.Column(String(255), unique=True)
    PASSWORD = db.Column(String(255))
    STAFF_CLASS_ID = db.Column(Integer)
    STAFF_CLASS = db.Column(String(32))

    def __repr__(self):
        return "(STAFF_ID='%s', STORE_ID='%s', STAFF_NUMBER='%s', STAFF_NAME='%s', , E_MAIL='%s', PASSWORD='%s', STAFF_CLASS_ID='%s',STAFF_CLASS='%s')" % (self.STAFF_ID, self.STORE_ID, self.STAFF_NUMBER, self.STAFF_NAME, self.E_MAIL, self.PASSWORD, self.STAFF_CLASS_ID, self.STAFF_CLASS)

#Class_Middleテーブル定義
class Menu(db.Model):
    __tablename__ = 'menus'

    MENU_ID = db.Column(Integer, primary_key=True)
    STORE_ID = db.Column(Integer)
    STAFF_ID = db.Column(Integer)   #登録・更新者を把握するのに必要
    CLASS_1_ID = db.Column(Integer) #大分類を示すクラス
    CLASS_1 = db.Column(String(5))
    CLASS_2_ID = db.Column(Integer)    #中分類を示すクラス
    CLASS_2 = db.Column(String(64))
    CLASS_3_ID = db.Column(Integer)    #中分類を示すクラス
    CLASS_3 = db.Column(String(64))    #小分類を示すクラス

    def __repr__(self):
        return "(MENU_ID='%s', STORE_ID='%s', STAFF_ID='%s', CLASS_1_ID='%s', CLASS_1='%s', CLASS_2_ID='%s', CLASS_2='%s', CLASS_3_ID='%s', CLASS_3='%s')" % (self.MENU_ID, self.STORE_ID, self.STAFF_ID, self.CLASS_1_ID, self.CLASS_1, self.CLASS_2_ID, self.CLASS_2, self.CLASS_3_ID, self.CLASS_3)

db.create_all()

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/create_account', methods = ['POST', 'GET'])
def create_account():
    #Staffテーブルに会員情報を登録する
    if request.method == 'POST':
        e_mail = request.form['e_mail']
        password = hash_password(request.form['password'])

        try:
            double_create_check = db.session.query(Staff).filter_by(E_MAIL=e_mail).one()
            print(double_create_check.E_MAIL + " is exist")
            return render_template('regierror_1.html')
        except NoResultFound as ex:
            print(ex)
            #ユーザー新規登録部分
            try:
                db.session.query(Staff).filter_by(STAFF_CLASS_ID=1, E_MAIL=e_mail).one()    #STAFF_CLASS_IDの代表者コードは1とする(今後一般職、マネージャーなどで利用できる権利を分けたい)
                db.session.add(Staff(E_MAIL=e_mail, PASSWORD=password))
                db.session.commit()
                db.session.close()
                return render_template('regierror_2.html')
            except:
                db.session.add(Staff(E_MAIL=e_mail, PASSWORD=password, STAFF_CLASS_ID=1, STAFF_CLASS="Representative")) #代表者として登録
                store_create=db.session.query(Staff).filter_by(STAFF_CLASS_ID=1, E_MAIL=e_mail).one() #登録した代表者のレコードを抽出
                store_id=store_create.STAFF_ID  #登録した代表者のIDを取得
                print(store_id)
                store_create.STORE_ID=store_id #登録した代表者のIDをSTORE_IDとしてstaffsテーブルに代入
                db.session.add(Store(STORE_ID=store_id))    #代表者が登録された場合、新しいお店としてstoresテーブルに登録
                db.session.commit()
                db.session.close()
            return render_template('regicomp.html')

    return render_template('login.html')

@app.route("/login", methods = ['POST', 'GET'])
def login():
    #DB情報を元にログイン
    # session['logged_in'] = False

    if request.method == 'POST':

        e_mail = request.form['e_mail']
        password = request.form['password']

        try:
            login_user = db.session.query(Staff).filter_by(E_MAIL=e_mail).one()
            print(login_user)
            session['store_id'] = login_user.STORE_ID
            username_session = login_user.STORE_ID#デバック用
            print(username_session)#デバック用
            login_check = verify_password(login_user.PASSWORD, password)
            # print(login_user)
            if login_check == True:
                #パスワードOKの処理
                session['logged_in'] = True
                return render_template('index.html')
            else:
                #パスワードNGの処理
                return render_template('login_error.html')
        except:
            return render_template('login_error.html')

    if session['logged_in']:
        return render_template('index.html')
    else:
        return render_template('login.html')

@app.route('/store_information_registration', methods = ['POST', 'GET'])
def store_information_registration():
    if request.method == 'POST':
        store_id = request.form['store_id']
        store_name = request.form['store_name']
        print(store_name)
        print(store_id)
        try:
            store_update = db.session.query(Store).filter(Store.STORE_ID==store_id).one() #STORE_IDとSTORE_NAMEをクエリに追加
            print(store_update)
            store_update.STORE_NAME = store_name
            db.session.commit()
            db.session.close()
            return render_template('index.html')
        except:
            store_name = None
            return render_template('add_menu.html')

# メニューリスト表示
@app.route('/show_menu' , methods = ['POST', 'GET'])
def add_menu():

        menu_list = db.session.query(Menu).filter_by(MENU_ID=menu_id, CLASS_1_ID=class_1_ID, CLASS_1=class_1, CLASS_2_ID=class_1_in, CLASS_2=class_2, CLASS_3_ID=class_3, CLASS_3=class_1).\
            all()
        class_middles = db.session.query(Food_Drink.CLASS_MIDDLE, Food_Drink.KIND).\
            distinct(Food_Drink.CLASS_MIDDLE).\
            all()
        return render_template('add_menu.html',class_middles=class_middles, menu_infos=menu_infos)
        # return render_template('froala.html', class_middles=class_middles, menu_infos=menu_infos)#froalaデバッグ

# メニュー削除
@app.route('/delete_menu' , methods = ['POST', 'GET'])
def delete_menu():
        if request.method == 'POST':
            try:
                menu_list = request.form.getlist("name_of_dish")
                print(menu_list)
                print(len(menu_list))
            except:#この処理必要ない気がする
                menu_list_food = None
            #とりあえず以下ドリンクは削除処理はいらない(menuで一元管理しているため)
            # try:
            #     menu_list_drink = request.form.getlist("drink_")
            # except:#この処理必要ない気がする
            #     menu_list_drink = None

            # if len(menu_list_food) != 0:
            for i in range(len(menu_list)):
                db.session.query(Food_Drink).filter(Food_Drink.NAME_OF_DISH==menu_list[i]).delete()
                db.session.commit()
                db.session.close()
            #とりあえず以下ドリンクは削除処理はいらない(menuで一元管理しているため)
            # for j in range(len(menu_list_drink)):
            #     db.session.query(Food_Drink).filter(Food_Drink.NAME_OF_DISH==menu_list_drink[j]).delete()
            #     db.session.commit()

        menu_infos = db.session.query(Food_Drink.ID, Food_Drink.KIND, Food_Drink.CLASS_MIDDLE, Food_Drink.NAME_OF_DISH, Food_Drink.PRICE).\
            order_by(Food_Drink.CLASS_MIDDLE).\
            all()
        return redirect("/add_menu")

# メニュー作成
@app.route('/create_menu', methods = ['POST', 'GET'])
def create_menu():
    if request.method == 'POST':
        user_id = request.form['user_id']
        name_of_dish = request.form['name_of_dish']
        price = request.form['price']
        food_drink = request.form["food_drink"]
        class_middle = request.form["class_middle"]
        # kind_idの設定
        if name_of_dish == "food":
            kind_id = 0
        else:
            kind_id = 1

        try:#menuの重複があればexceptへ
            db.session.add(Food_Drink(USER_ID=user_id, KIND_ID=kind_id, KIND=food_drink, NAME_OF_DISH=name_of_dish, PRICE=price, CLASS_MIDDLE = class_middle))
            db.session.commit()
        except:#menuの重複検知
            return render_template('menu_exist.html')
    return redirect("/add_menu")
#テスト用コメントアウト-S　問題がなければ削除OK
    #     menu_infos = db.session.query(Food_Drink.ID, Food_Drink.KIND, Food_Drink.CLASS_MIDDLE, Food_Drink.NAME_OF_DISH, Food_Drink.PRICE).\
    #         order_by(Food_Drink.CLASS_MIDDLE).\
    #         all()
    #     class_middles = db.session.query(Food_Drink.CLASS_MIDDLE, Food_Drink.KIND).\
    #         distinct(Food_Drink.CLASS_MIDDLE).\
    #         all()
    #     return render_template('add_menu.html',class_middles=class_middles, menu_infos=menu_infos)
    #     # return render_template('froala.html', class_middles=class_middles, menu_infos=menu_infos)#froalaデバッグ
    # return render_template('add_menu.html')
#テスト用コメントアウト-E　問題がなければ削除OK

@app.route('/revise_menu')
def revise_menu():
    return "未実装"

@app.route("/logout")
def logout():
    # session['logged_in'] = False
    session.clear()
    return redirect('/')


if __name__ == '__main__':
    app.run(debug=True)
