#!/usr/bin/env python3
import unittest
import dis

from bitten import package_code

class SourceCodeToBytecodeTest(unittest.TestCase):
    def test_simple(self):
        pack = self.package_code_helper('x = 2')
        self.x_equals_2_invariant(pack)

    def test_blank_lines(self):
        """Make sure that blank lines are ignored."""
        pack = self.package_code_helper('\n\nx = 2\n\n\n')
        self.x_equals_2_invariant(pack)

    def package_code_helper(self, code):
        return package_code('<module>', code.splitlines(), dis.Bytecode(code))

    def x_equals_2_invariant(self, pack):
        """Assert all necessary facts about the code package created from 'x = 2'"""
        self.code_package_invariants(pack)
        inner_pack = pack['package']
        self.assertEqual(len(inner_pack), 1)
        self.assertEqual(inner_pack[0]['source'], 'x = 2')
        self.assertEqual(inner_pack[0]['bytecode'], [j('LOAD_CONST', '0', '2'),
                                                    j('STORE_NAME', '0', 'x'),
                                                    j('LOAD_CONST', '1', 'None'),
                                                    j('RETURN_VALUE', None, None)])

    def code_package_invariants(self, c):
        """Assert some necessary facts about code package objects. Normally we wouldn't bother
           checking the types of Python objects, but it's actually important in this case because
           these will have to be JSON serialized and handled by client-side JavaScript.
        """
        self.assertIsInstance(c, dict)
        self.assertEqual(len(c), 2)
        self.assertIn('name', c)
        self.assertIn('package', c)
        self.assertIsInstance(c['name'], str)

    def code_pair_invariants(self, cp):
        """Assert some necessary facts about code pair objects."""
        self.assertIsInstance(cp, dict)
        self.assertEqual(len(cp), 2)
        self.assertIn('source', cp)
        self.assertIn('bytecode', cp)
        self.assertIsInstance(cp['source'], str)
        self.assertIsInstance(cp['bytecode'], list)
        for b in cp['bytecode']:
            self.bytecode_invariants(b)

    def bytecode_invariants(self, b):
        """Assert some necessary facts about bytecode objects."""
        self.assertIsInstance(b, dict)
        self.assertEqual(len(b), 3)
        self.assertIn('opname', b)
        self.assertIn('arg', b)
        self.assertIn('argrepr', b)
        for val in b.values():
            self.assertIsInstance(val, str)

def j(opname, arg, argrepr):
    """Shortcut for creating the JSON bytecode objects."""
    if arg is not None:
        return {'opname':opname, 'arg':arg, 'argrepr':argrepr}
    else:
        return {'opname':opname, 'arg':'', 'argrepr':''}

if __name__ == '__main__':
    unittest.main()
