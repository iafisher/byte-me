import dis
from collections import namedtuple

def package_module(source):
    """Return a list of CodePackage objects for each function in the source code, as well as a
       package for the module as a whole.
    """
    module_bytecode = dis.Bytecode(source)
    source_lines = source.splitlines()
    module_package = CodePackage('<module>', source_lines, module_bytecode)
    functions = [CodePackage(n, source_lines, dis.Bytecode(f))
                    for n, f in extract_functions(module_bytecode.codeobj)]
    return [module_package] + functions


class CodePackage:
    """Source code paired with bytecode instructions."""
    
    def __init__(self, name, source_lines, bytecode):
        self.name = name
        self.code_pairs = [CodePair(n, source_lines[n-1], g) for n, g in group_bytecode(bytecode)]

    @classmethod
    def fromfunction(cls, source_lines, f):
        """Construct a code package from the source code of an entire module and a code object of
           a function defined within that module.
        """
        return cls(f.co_name, source_lines, dis.Bytecode(f))


CodePair = namedtuple('CodePair', ['lineno', 'source', 'bytecode'])


def group_bytecode(bytecode):
    """Yield (lineno, (<bytecode instructions>)) tuples for the bytecode object."""
    bytecode_iter = iter(bytecode)
    try:
        first_instruction = next(bytecode_iter)
    except StopIteration:
        pass
    else:
        collect = [first_instruction]
        last_line = first_instruction.starts_line
        for instruction in bytecode_iter:
            if instruction.starts_line and collect:
                yield (last_line, tuple(collect))
                collect.clear()
                last_line = instruction.starts_line
            collect.append(instruction)
        if collect:
            yield (last_line, tuple(collect))

def extract_functions(codeobj, prefix=''):
    """Yield (name, code_obj) pairs for all functions, classes, list comprehensions etc. defined
       in the code object, including nested definitions. The prefix is prepended to each name; it
       should either by the empty string or a string ending with a period.
    """
    code_type = type(codeobj)
    for x in codeobj.co_consts:
        if isinstance(x, code_type):
            fullname = prefix + x.co_name
            yield (fullname,  x)
            yield from extract_functions(x, fullname + '.')
