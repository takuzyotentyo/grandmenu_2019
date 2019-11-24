#__pycache__の自動作成が鬱陶しいので作成しないように
import sys
sys.dont_write_bytecode = True

from flaskr import app

if __name__ == '__main__':
    app.run(debug=True)
