import dis
from collections import namedtuple

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', name='index')

BytecodeElement = namedtuple('BytecodeElement', ['string', 'code'])

@app.route('/', methods=['POST'])
def index_as_post():
    try:
        source_code = request.form['source_code']
        bytecode = dis.Bytecode(source_code)
        bytecode_list = []
        for inst, line in zip(bytecode, bytecode.dis().splitlines()):
            bytecode_list.append(BytecodeElement(line, inst.opname))
        return render_template('index.html', name='index', source_code=source_code, 
                                                           bytecode_list=bytecode_list)
    except SyntaxError:
        return render_template('index.html', name='index', source_code=source_code,
                                                           error_msg='Syntax error')
