import dis
import json

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', name='index')

@app.route('/bytecode', methods=['POST'])
def bytecode_post():
    """Handle POST requests of source code by returning the compiled bytecode as JSON. A sample
       return value is 

           [
             {'source':'x = 5', bytecode:['LOAD_CONST 0 (5)', 'STORE_NAME 0 (x)']}
           ]
    """
    try:
        source_code = request.form['sourceCode']
        bytecode = dis.Bytecode(source_code)
    except SyntaxError as e:
        return json.dumps('Syntax error on line {}'.format(e.lineno))
    else:
        ret = []
        # match each source code line with its bytecode instructions, and package them as a single
        # JSON object
        for line, inst_group in zip(source_code.splitlines(), group_bytecode(bytecode)):
            ret.append({'source':line, 'bytecode':list(map(inst_to_str, inst_group)) })
        return json.dumps(ret)

def inst_to_str(inst):
    """Convert a bytecode instruction to a string."""
    if inst.arg is not None:
        return {'opname': inst.opname,'arg': str(inst.arg), 'argrepr': inst.argrepr}
    else:
        return {'opname': inst.opname, 'arg': "", 'argrepr': ""}

def group_bytecode(bytecode):
    """Yield tuples of bytecode instructions, with each tuple matching a single line of source
       code.
    """
    collect = []
    for inst in bytecode:
        if inst.starts_line:
            if collect:
                yield tuple(collect)
            collect.clear()
        collect.append(inst)
    if collect:
        yield tuple(collect)

    
