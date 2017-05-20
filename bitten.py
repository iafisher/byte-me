from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', name='index')

@app.route('/', methods=['POST'])
def index_as_post():
    #print(request.form['source_code']) # doesn't work
    return render_template('index.html', name='index')
