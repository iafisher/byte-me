#!/usr/bin/env python3
import unittest

from bitten import source_code_to_bytecode

class SourceCodeToBytecodeTest(unittest.TestCase):
    def test_simple(self):
        pack = source_code_to_bytecode('x = 2')
        self.x_equals_2_invariant(pack)

    def test_blank_lines(self):
        """Make sure that blank lines are ignored."""
        pack = source_code_to_bytecode('\n\nx = 2\n\n\n')
        self.x_equals_2_invariant(pack)

    def test_pass(self):
        """Make sure that pass statements show up with no bytecode."""
        pack = source_code_to_bytecode('pass\npass\npass')
        self.code_package_invariants(pack)
        self.assertEqual(len(pack), 3)
        self.assertEqual(pack[0]['source'], 'pass')
        self.assertEqual(pack[1]['source'], 'pass')
        self.assertEqual(pack[2]['source'], 'pass')
        self.assertEqual(pack[0]['bytecode'], [])
        self.assertEqual(pack[1]['bytecode'], [])
        self.assertEqual(pack[2]['bytecode'], [j('LOAD_CONST', '0', 'None'),
                                               j('RETURN_VALUE', None, None)])

    def x_equals_2_invariant(self, pack):
        """Assert all necessary facts about the code package created from 'x = 2'"""
        self.code_package_invariants(pack)
        self.assertEqual(len(pack), 1)
        self.assertEqual(pack[0]['source'], 'x = 2')
        self.assertEqual(pack[0]['bytecode'], [j('LOAD_CONST', '0', '2'),
                                               j('STORE_NAME', '0', 'x'),
                                               j('LOAD_CONST', '1', 'None'),
                                               j('RETURN_VALUE', None, None)])

    def code_package_invariants(self, c):
        """Assert some necessary facts about code package objects. Normally we wouldn't bother
           checking the types of Python objects, but it's actually important in this case because
           these will have to be JSON serialized and handled by client-side JavaScript.
        """
        self.assertIsInstance(c, list)
        for pair in c:
            self.code_pair_invariants(pair)

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
