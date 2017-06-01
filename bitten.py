import dis
from collections import namedtuple

def package_module(source):
    """Return a list of CodePackage objects for each function in the source code, as well as a
       package for the module as a whole.
    """
    module_bytecode = dis.Bytecode(source)
    source_lines = source.splitlines()
    module_package = CodePackage('<module>', source_lines, module_bytecode)
    functions = [CodePackage.fromfunction(source_lines, f)
                    for f in extract_functions(module_bytecode.codeobj)]
    return [module_package] + functions


class CodePackage:
    """Source code paired with bytecode instructions."""
    
    def __init__(self, name, source_lines, bytecode):
        self.name = name
        self.code_pairs = [CodePair(source_lines[n], g) for n, g in group_bytecode(bytecode)]

    @classmethod
    def fromfunction(cls, source_lines, f):
        """Construct a code package from the source code of an entire module and a code object of
           a function defined within that module.
        """
        bytecode = dis.Bytecode(f)
        # change the first line from the 'def ...' line to the first line of the body
        bytecode.first_line += 1
        return cls(f.co_name, source_lines, bytecode)


CodePair = namedtuple('CodePair', ['source', 'bytecode'])


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

def extract_functions(codeobj):
    """Return a list of all functions defined in the code object, including nested function
       definitions.
    """
    code_type = type(codeobj)
    ret = []
    for x in codeobj.co_consts:
        if isinstance(x, code_type):
            ret.append(x)
            ret.extend(extract_functions(x))
    return ret
