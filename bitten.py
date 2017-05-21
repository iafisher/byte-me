import dis

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', name='index')

@app.route('/', methods=['POST'])
def index_as_post():
    try:
        source_code = request.form['source_code']
        bytecode = dis.Bytecode(source_code)
        return render_template('index.html', name='index', source_code=source_code, 
                                                           bytecode=bytecode.dis())
    except SyntaxError:
        return render_template('index.html', name='index', source_code=source_code,
                                                           error_msg='Syntax error')
