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
    source_code = request.form['sourceCode']
    try:
        ret = []
        for i, line in enumerate(source_code.splitlines()):
            # last two instructions are spurious
            instructions = list(dis.get_instructions(line))[:-2]
            if line or instructions:
                ret.append({'source':line, 'bytecode':list(map(instruction_to_json, instructions))})
        return json.dumps(ret)
    except SyntaxError:
        return json.dumps('Syntax error on line {}'.format(i + 1))

def instruction_to_json(inst):
    """Convert a bytecode instruction to a JSON-serializable object."""
    if inst.arg is not None:
        return {'opname':inst.opname, 'arg':str(inst.arg), 'argrepr':inst.argrepr}
    else:
        return {'opname':inst.opname, 'arg':"", 'argrepr':""}
