"""The module for handling the Flask stuff.

The website boils down a single HTML page and a POST handler that takes in source code and spits
out a code package that pairs each line of source code with its matching CPython bytecode
instructions. For details, see the bytecode_post function.
"""
import dis
import json
import html
import itertools

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
    ret = [package_code(f.co_name, extract_source_code(source.splitlines(), f), dis.Bytecode(f)) 
               for f in functions]
    # prepend the <module> code so that it shows up first on the website
    ret = [package_code('<module>', source.splitlines(), module_bytecode)] + ret
    return html.escape(json.dumps(ret), quote=False)

def package_code(name, source_code, bytecode):
    ret = []
    for lineno, byte_group in group_bytecode(bytecode):
        try:
            ret.append({'source': source_code[lineno],
                        'bytecode': list(map(instruction_to_json, byte_group))})
        except IndexError:
            print(source_code, lineno)
    return {'name':name, 'package':ret}

def extract_functions(bytecode):
    """Return a list of function code objects that are defined in the bytecode."""
    code_object = bytecode.codeobj
    code_type = type(code_object)
    functions = [x for x in code_object.co_consts if isinstance(x, code_type)]
    return functions

def extract_source_code(source_lines, f_code):
    """Given the source code for an entire module and the code object of a single function, return
       the source code of that function as a list of strings.
    """
    bytecode = dis.Bytecode(f_code)
    last_line = max(i.starts_line for i in bytecode if i.starts_line is not None)
    return source_lines[bytecode.first_line : last_line + 1]

def instruction_to_json(inst):
    """Convert a bytecode instruction to a JSON-serializable object."""
    if inst.arg is not None:
        return {'opname': inst.opname, 'arg': str(inst.arg), 'argrepr': inst.argrepr}
    else:
        return {'opname': inst.opname, 'arg': "", 'argrepr': ""}

def group_bytecode(bytecode):
    """Yield (lineno, (<bytecode instructions>)) tuples for the bytecode object. The line numbers
       are zero-indexed.
    """
    collect = []
    last_line = bytecode.first_line
    for instruction in bytecode:
        if instruction.starts_line and collect:
            yield (last_line - 1, tuple(collect))
            collect.clear()
            last_line = instruction.starts_line
        collect.append(instruction)
    if collect:
        yield (last_line - 1, tuple(collect))
