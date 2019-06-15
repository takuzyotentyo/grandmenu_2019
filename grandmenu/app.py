#coding:utf-8

# Flaskのインポート
from flask import Flask, render_template, session, redirect, url_for, flash, request
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
# psycopg2のインポート
import psycopg2

#SQLAlchemy必要に応じて適宜導入
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm.exc import NoResultFound
#from sqlalchemy.ext.declarative import declarative_base
#from sqlalchemy.orm import sessionmaker



app = Flask(__name__)

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
class User(db.Model):
    __tablename__ = 'login_user'

    ID = db.Column(Integer, primary_key=True)
    E_MAIL = db.Column(String(255), unique=True)
    PASS_WORD = db.Column(String(255))

    def __repr__(self):
        return "(ID='%s', E_MAIL='%s', PASS_WORD='%s')" % (self.ID, self.E_MAIL, self.PASS_WORD)

#Food_Drinkテーブル定義
class Food_Drink(db.Model):
    __tablename__ = 'food_drink'
    USER_ID = db.Column(Integer, unique=True)#20190430
    ID = db.Column(Integer, primary_key=True)
    KIND = db.Column(String(5))
    SECONDARY_NAME = db.Column(String(64))
    NAME_OF_DISH = db.Column(String(64), unique=True)
    PRICE = db.Column(Integer)

    def __repr__(self):
        return "(KIND='%s', NAME_OF_DISH='%s', PRICE='%s')" % (self.KIND, self.NAME_OF_DISH, self.PRICE)


db.create_all()

@app.route('/', methods = ['POST', 'GET'])
def login():
    #DBに会員情報を登録する
    if request.method == 'POST':
        e_mail = request.form['e_mail']
        pass_word = hash_password(request.form['pass_word'])

        try:
            dupli_user = db.session.query(User).filter_by(E_MAIL=e_mail).one()
            print(dupli_user.E_MAIL + " is exist")
            return render_template('regierror.html')
        except NoResultFound as ex:
            print(ex)
            db.session.add(User(E_MAIL=e_mail, PASS_WORD=pass_word))
            db.session.commit()
            # db.session.close()
            return render_template('regicomp.html')

    return render_template('login.html')

@app.route('/registration')
def registration():
    return render_template('registration.html')

# メニューリスト表示
@app.route('/add_menu' , methods = ['POST', 'GET'])
def add_menu():

        menu_infos = db.session.query(Food_Drink.ID, Food_Drink.KIND, Food_Drink.SECONDARY_NAME, Food_Drink.NAME_OF_DISH, Food_Drink.PRICE).\
            order_by(Food_Drink.SECONDARY_NAME).\
            all()

        return render_template('add_menu.html',menu_infos=menu_infos)

# メニュー削除
@app.route('/delete_menu' , methods = ['POST', 'GET'])
def delete_menu():
        if request.method == 'POST':
            try:
                menu_list_food = request.form.getlist("food_")
                print(menu_list_food)
                print(len(menu_list_food))
            except:#この処理必要ない気がする
                menu_list_food = None
            try:
                menu_list_drink = request.form.getlist("drink_")
            except:#この処理必要ない気がする
                menu_list_drink = None

            # if len(menu_list_food) != 0:
            for i in range(len(menu_list_food)):
                db.session.query(Food_Drink).filter(Food_Drink.NAME_OF_DISH==menu_list_food[i]).delete()
                db.session.commit()

            for j in range(len(menu_list_drink)):
                db.session.query(Food_Drink).filter(Food_Drink.NAME_OF_DISH==menu_list_drink[j]).delete()
                db.session.commit()

        menu_infos = db.session.query(Food_Drink.ID, Food_Drink.KIND, Food_Drink.SECONDARY_NAME, Food_Drink.NAME_OF_DISH, Food_Drink.PRICE).\
            order_by(Food_Drink.SECONDARY_NAME).\
            all()

        return render_template('add_menu.html',menu_infos=menu_infos)

# メニュー作成
@app.route('/create_menu', methods = ['POST', 'GET'])
def create_menu():
    if request.method == 'POST':
        name_of_dish = request.form['name_of_dish']
        price = request.form['price']
        food_drink = request.form["food_drink"]
        secondary_name = request.form["secondary_name"]
        try:#menuの重複があればexceptへ
            db.session.add(Food_Drink(KIND=food_drink, NAME_OF_DISH=name_of_dish, PRICE=price, SECONDARY_NAME = secondary_name))
            db.session.commit()
        except:#menuの重複検知
            return render_template('menu_exist.html')
        menu_infos = db.session.query(Food_Drink.ID, Food_Drink.KIND, Food_Drink.SECONDARY_NAME, Food_Drink.NAME_OF_DISH, Food_Drink.PRICE).\
            order_by(Food_Drink.SECONDARY_NAME).\
            all()

        return render_template('add_menu.html',menu_infos=menu_infos)
    return render_template('add_menu.html')

@app.route('/revise_menu')
def revise_menu():
    return "未実装"


@app.route("/index", methods = ['POST', 'GET'])
def index():
    #DB情報を元にログイン
    # session['logged_in'] = False

    if request.method == 'POST':

        e_mail = request.form['e_mail']
        pass_word = request.form['pass_word']

        try:
            login_user = db.session.query(User).filter_by(E_MAIL=e_mail).one()
            session['username'] = login_user.ID
            username_session = login_user.ID#デバック用
            print(username_session)#デバック用
            login_check = verify_password(login_user.PASS_WORD, pass_word)
            print(login_user)
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
