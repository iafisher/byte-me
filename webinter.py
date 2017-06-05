"""The module for handling the Flask stuff.

The website boils down a single HTML page and a POST handler that takes in source code and spits
out a code package that pairs each line of source code with its matching CPython bytecode
instructions. For details, see the bytecode_post function.
"""
import dis
import json
import html
import itertools

from bitten import CodePackage, CodePair, package_module

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
    try:
        packlist = package_module(request.form['sourceCode'])
    except SyntaxError as e:
        ret = 'Syntax error at line ' + str(e.lineno)
    else:
        ret = json_comply(packlist)
    return html.escape(json.dumps(ret), quote=False)


def json_comply(packlist):
    return [json_comply_code_package(package) for package in packlist]

def json_comply_code_package(package):
    return {'name':package.name, 'package':json_comply_code_pairs(package.code_pairs)}

def json_comply_code_pairs(code_pairs):
    return [{'source':p.source, 'bytecode':json_comply_bytecode(p.bytecode)} for p in code_pairs]

def json_comply_bytecode(bytecode_list):
    ret = []
    for inst in bytecode_list:
        if inst.arg is not None:
            ret.append({'opname':inst.opname, 'arg':str(inst.arg), 'argrepr':inst.argrepr})
        else:
            ret.append({'opname':inst.opname, 'arg':'', 'argrepr':''})
    return ret
