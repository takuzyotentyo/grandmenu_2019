#パスワードハッシュ関連
from werkzeug.security import generate_password_hash, check_password_hash
#QRコード関連
import qrcode as qr
import base64
from io import BytesIO
from PIL import Image


#ハッシュパスワードを作成する関数
def hash_password(original_pass):
    return generate_password_hash(original_pass)

#ハッシュパスワードと元のパスワードを比較する関数
def verify_password(hash_pass, original_pass):
    return check_password_hash(hash_pass, original_pass)


# QRコードを生成する関数
def qrmaker(code):
    #デバッグ1-ON-S
    # qr.add_data(code)
    # qr.make()
    # qr_img = qr.make_image(fill_color="black", back_color="white")#色指定は#rrggbb可能
    #デバッグ1-ON-E

    #デバッグ1-OFF-S
    qr_img = qr.make(str(code))
    #デバッグ1-OFF-S

    # 画像書き込み用バッファを確保して画像データをそこに書き込む
    buf = BytesIO()
    qr_img.save(buf,format="png")

    # バイナリデータをbase64でエンコードし、それをさらにutf-8でデコードしておく
    qr_b64str = base64.b64encode(buf.getvalue()).decode("utf-8")

    # image要素のsrc属性に埋め込めこむために、適切に付帯情報を付与する
    qr_b64data = "data:image/png;base64,{}".format(qr_b64str)

    return qr_b64data
