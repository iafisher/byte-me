from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', name='index')

@app.route('/', methods=['POST'])
def index_as_post():
    return 'hello world'
