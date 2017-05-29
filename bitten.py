import dis
import json

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', name='index')

@app.route('/bytecode', methods=['POST'])
def bytecode_post():
    ret = []
    try:
        source_code = request.form['sourceCode']
        bytecode = dis.Bytecode(source_code)
    except SyntaxError:
        pass
    else:
        for line, inst_group in zip(source_code.splitlines(), group_bytecode(bytecode)):
            ret.append({'source':line, 'bytecode':list(map(inst_to_str, inst_group))})
    return json.dumps(ret)

def inst_to_str(inst):
    """Convert a bytecode instruction to a string."""
    if inst.arg is not None:
        padding = ' ' * (25 - len(inst.opname))
        return '{0.opname}{1}{0.arg} ({0.argrepr})'.format(inst, padding)
    else:
        return inst.opname

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
