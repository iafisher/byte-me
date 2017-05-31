"""The module for handling the Flask stuff.

The website boils down a single HTML page and a POST handler that takes in source code and spits
out a code package that pairs each line of source code with its matching CPython bytecode
instructions. For details, see the bytecode_post function.
"""
import dis
import json

from flask import Flask, render_template, request
app = Flask(__name__)

@app.route('/')
def index():
    """Render the homepage."""
    return render_template('index.html', name='index')

@app.route('/bytecode', methods=['POST'])
def bytecode_post():
    """Handle POST requests of source code by returning the compiled bytecode as JSON. A sample
       return value is

           [
             {'source':'x = 5', bytecode:['LOAD_CONST 0 (5)', 'STORE_NAME 0 (x)']}
           ]
    """
    return json.dumps(source_code_to_bytecode(request.form['sourceCode']))

def source_code_to_bytecode(source_code):
    """Convert the source code (as a string) to a JSON representation of the bytecode. See the
       docstring for bytecode_post for the exact format.
    """
    try:
        bytecode = dis.get_instructions(source_code)
    except SyntaxError:
        return 'Syntax error on line {}'.format(i + 1)
    else:
        ret = []
        for line, byte_group in zip(source_code.splitlines(), group_bytecode(bytecode)):
            # this check prevents blank lines from being added
            if line or byte_group:
                ret.append({'source':line, 'bytecode':list(map(instruction_to_json, byte_group))})
        return ret

def instruction_to_json(inst):
    """Convert a bytecode instruction to a JSON-serializable object."""
    if inst.arg is not None:
        return {'opname':inst.opname, 'arg':str(inst.arg), 'argrepr':inst.argrepr}
    else:
        return {'opname':inst.opname, 'arg':"", 'argrepr':""}

def group_bytecode(bytecode):
    """Yield a tuple of bytecode instructions for each line of the source code that the bytecode
       was compiled from. For lines of source code with no correspondent bytecode instructions,
       the empty tuple is yielded.
    """
    collect = []
    last_line = 1
    for instruction in bytecode:
        if instruction.starts_line:
            # when encountering an instruction starting a new line, yield the bytecode from the
            # previous line (as long as it's not the first line)
            if instruction.starts_line != 1:
                yield tuple(collect)
                collect.clear()
            # yield empty tuples for lines with no bytecode instructions, so that they can be
            # paired correctly
            for _ in range(last_line, instruction.starts_line - 1):
                yield tuple()
            last_line = instruction.starts_line
        collect.append(instruction)
    if collect:
        yield tuple(collect)
