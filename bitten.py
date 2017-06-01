"""The module for handling the Flask stuff.

The website boils down a single HTML page and a POST handler that takes in source code and spits
out a code package that pairs each line of source code with its matching CPython bytecode
instructions. For details, see the bytecode_post function.
"""
import dis
import json
import html

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
        {'name':'<module>', 
         'package':[
                    {'source':'x = 5',
                     'bytecode' [
                                 {'arg': '0', 'argrepr': '5', 'opname': 'LOAD_CONST'}, 
                                 ...
                                ]
                     },
                     ...
                    ]
        },
        ...
       ]

    """
    source = request.form['sourceCode']
    try:
        module_bytecode = dis.Bytecode(source)
    except SyntaxError as e:
        return json.dumps('Syntax error at line {}'.format(e.lineno))
    functions = extract_functions(module_bytecode)
    ret = [{'name':f.co_name, 'package':package_code([''] * 100, f)} for f in functions]
    ret = [{'name':'<module>', 'package':package_code(source.splitlines(), module_bytecode)}] + ret
    return html.escape(json.dumps(ret), quote=False)

def package_code(source_code, bytecode):
    ret = []
    for line, byte_group in zip(source_code, group_bytecode(bytecode)):
    	# this check prevents blank lines from being added
        if line and byte_group:
            ret.append({'source': line, 'bytecode': list(map(instruction_to_json, byte_group))})
    return ret

def extract_functions(bytecode):  # nomenclature!
    code_object = bytecode.codeobj
    code_type = type(code_object)
    functions = [x for x in code_object.co_consts if isinstance(x, code_type)]
    # functions = {x.co_name: x for x in code_object.co_consts if isinstance(x, code_type)}
    ### TO GET THE FUNCTION'S NAME
    #f = functions[0]
    #name = f.co_name
    ###
    return functions

def instruction_to_json(inst):
    """Convert a bytecode instruction to a JSON-serializable object."""
    if inst.arg is not None:
        return {'opname': inst.opname, 'arg': str(inst.arg), 'argrepr': inst.argrepr}
    else:
        return {'opname': inst.opname, 'arg': "", 'argrepr': ""}

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
