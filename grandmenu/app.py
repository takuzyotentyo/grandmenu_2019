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

#Userテーブル定義
class Store(db.Model):
    __tablename__ = 'stores'

    STORE_ID = db.Column(Integer, primary_key=True)
    USER_NAME = db.Column(String(255))
    E_MAIL = db.Column(String(255), unique=True)
    PASSWORD = db.Column(String(255))
    STORE_NAME = db.Column(String(255))

    def __repr__(self):
        return "(STORE_ID='%s', E_MAIL='%s', PASSWORD='%s', STORE_NAME='%s')" % (self.STORE_ID, self.E_MAIL, self.PASSWORD, self.STORE_NAME)

#Food_Drinkテーブル定義
class Food_Drink(db.Model):
    __tablename__ = 'food_drink'

    ID = db.Column(Integer, primary_key=True)
    USER_ID = db.Column(Integer)#20190430
    KIND_ID = db.Column(Integer)
    KIND = db.Column(String(5))
    CLASS_MIDDLE_ID = db.Column(Integer)
    CLASS_MIDDLE = db.Column(String(64))
    NAME_OF_DISH_ID = db.Column(Integer)
    NAME_OF_DISH = db.Column(String(64), unique=True)
    PRICE = db.Column(Integer)
    MENU_ID = db.Column(Integer)

    def __repr__(self):
        return "(KIND='%s', NAME_OF_DISH='%s', PRICE='%s')" % (self.KIND, self.NAME_OF_DISH, self.PRICE)


db.create_all()

@app.route('/', methods = ['POST', 'GET'])
def login():
    #DBに会員情報を登録する
    if request.method == 'POST':
        e_mail = request.form['e_mail']
        password = hash_password(request.form['password'])

        try:
            dupli_stores = db.session.query(Store).filter_by(E_MAIL=e_mail).one()
            print(dupli_users.E_MAIL + " is exist")
            return render_template('login.html')
        except NoResultFound as ex:
            print(ex)
            db.session.add(Store(E_MAIL=e_mail, PASSWORD=password))
            db.session.commit()
            db.session.close()
            return render_template('regicomp.html')

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

    # return render_template('index.html')



# メニューリスト表示
@app.route('/add_menu' , methods = ['POST', 'GET'])
def add_menu():

        menu_infos = db.session.query(Food_Drink.ID, Food_Drink.KIND, Food_Drink.CLASS_MIDDLE, Food_Drink.NAME_OF_DISH, Food_Drink.PRICE).\
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


@app.route("/index", methods = ['POST', 'GET'])
def index():
    #DB情報を元にログイン
    # session['logged_in'] = False

    if request.method == 'POST':

        e_mail = request.form['e_mail']
        password = request.form['password']

        try:
            login_user = db.session.query(Store).filter_by(E_MAIL=e_mail).one()
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
        return "ERROR"

@app.route("/logout")
def logout():
    # session['logged_in'] = False
    session.clear()
    return redirect('/')


if __name__ == '__main__':
    app.run(debug=True)
