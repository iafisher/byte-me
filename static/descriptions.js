// These descriptions are heavily based on https://docs.python.org/3.4/library/dis.html
// Anything enclosed in {{ }} will be formatted as code in the output
// The string '{{ARGREPR}}' can be used wherever the argument should be interpolated
var descDict = {
    NOP: "Do nothing",
    POP_TOP: "Pop the top value off the stack",
    ROT_TWO: "Swap the top two values on the stack",
    ROT_THREE: "Move the top value to position three in the stack, moving the second and third " +
                "items up",
    DUP_TOP: "Duplicate the reference on the top of the stack",
    DUP_TOP_TWO: "Duplicate the top two references on the stack, preserving order",
    UNARY_POSITIVE: "Set {{TOS}} to {{+TOS}}",
    UNARY_NEGATIVE: "Set {{TOS}} to {{-TOS}}",
    UNARY_NOT: "Set {{TOS}} to {{not TOS}}",
    UNARY_INVERT: "Set {{TOS}} to {{~TOS}}",
    GET_ITER: "Set {{TOS}} to {{iter(TOS)}}",
    BINARY_POWER: "Set {{TOS}} to {{TOS1 ** TOS}}",
    BINARY_MULTIPLY: "Set {{TOS}} to {{TOS1 * TOS}}",
    BINARY_FLOOR_DIVIDE: "Set {{TOS}} to {{TOS1 // TOS}}",
    BINARY_TRUE_DIVIDE: "Set {{TOS}} to {{TOS1 / TOS}}",
    BINARY_MODULO: "Set {{TOS}} to {{TOS1 % TOS}}",
    BINARY_ADD: "Set {{TOS}} to {{TOS1 + TOS}}",
    BINARY_SUBTRACT: "Set {{TOS}} to {{TOS1 - TOS}}",
    BINARY_SUBSCR: "Set {{TOS}} to {{TOS1[TOS]}}",
    BINARY_LSHIFT: "Set {{TOS}} to {{TOS1 << TOS}}",
    BINARY_RSHIFT: "Set {{TOS}} to {{TOS1 >> TOS}}",
    BINARY_AND: "Set {{TOS}} to {{TOS1 & TOS}}",
    BINARY_XOR: "Set {{TOS}} to {{TOS1 ^ TOS}}",
    BINARY_OR: "Set {{TOS}} to {{TOS1 | TOS}}",
    INPLACE_POWER: "Set {{TOS}} to {{TOS1 ** TOS}} in place",
    INPLACE_MULTIPLY: "Set {{TOS}} to {{TOS1 * TOS}} in place",
    INPLACE_FLOOR_DIVIDE: "Set {{TOS}} to {{TOS1 // TOS}} in place",
    INPLACE_TRUE_DIVIDE: "Set {{TOS}} to {{TOS1 / TOS}} in place",
    INPLACE_MODULO: "Set {{TOS}} to {{TOS1 % TOS}} in place",
    INPLACE_ADD: "Set {{TOS}} to {{TOS1 + TOS}} in place",
    INPLACE_SUBTRACT: "Set {{TOS}} to {{TOS1 - TOS}} in place",
    INPLACE_SUBSCR: "Set {{TOS}} to {{TOS1[TOS]}} in place",
    INPLACE_LSHIFT: "Set {{TOS}} to {{TOS1 << TOS}} in place",
    INPLACE_RSHIFT: "Set {{TOS}} to {{TOS1 >> TOS}} in place",
    INPLACE_AND: "Set {{TOS}} to {{TOS1 & TOS}} in place",
    INPLACE_XOR: "Set {{TOS}} to {{TOS1 ^ TOS}} in place",
    INPLACE_OR: "Set {{TOS}} to {{TOS1 | TOS}} in place",
    INPLACE_POWER: "Set {{TOS}} to TOS1 ** TOS in place",
    STORE_SUBSCR: "Set {{TOS1[TOS]}} to {{TOS2}}",
    DELETE_SUBSCR: "Do {{del TOS1[TOS]}}",
    PRINT_EXPR: "Pop {{TOS}} and print it",
    BREAK_LOOP: "Terminate a loop",
    CONTINUE_LOOP: "Continue executing at loop at {{ARGREPR}}",
    SET_ADD: "Add {{TOS}} to the set at {{TOS[-ARGREPR]}}",
    LIST_APPEND: "Append {{TOS}} to the list at {{TOS1[-ARGREPR]}}",
    MAP_ADD: "",
    RETURN_VALUE: "Return {{TOS}} to the caller of the function",
    YIELD_VALUE: "Pop {{TOS}} and yield it from a generator",
    YIELD_FROM: "Pop {{TOS}} and use it as a subiterator from a generator",
    IMPORT_STAR: "Pop {{TOS}} (interpreting it as a module) and import all symbols from it",
    POP_BLOCK: "Remove a block from the block stack",
    POP_EXCEPT: "Remove an exception handler block from the block stack",
    END_FINALLY: "End a finally clause",
    LOAD_BUILD_CLASS: "",
    SETUP_WITH: "Do set-up for a with statement",
    WITH_CLEANUP: "Do clean-up for a with statement",
    STORE_NAME: "Store {{TOS}} as {{ARGREPR}} in the local namespace",
    DELETE_NAME: "Delete {{ARGREPR}} from the local namespace",
    UNPACK_SEQUENCE: "Unpack {{ARGREPR}} values from {{TOS}} onto the stack right-to-left",
    UNPACK_EX: "",
    STORE_ATTR: "Set {{TOS.ARGREPR}} to {{TOS1}}",
    DELETE_ATTR: "Do {{del TOS.ARGREPR}}",
    STORE_GLOBAL: "Store {{TOS}} as {{ARGREPR}} in the global namespace",
    DELETE_NAME: "Delete {{ARGREPR}} from the global namespace",
    LOAD_CONST: "Push {{ARGREPR}} onto the stack",
    LOAD_NAME: "Retrieve the value stored as {{ARGREPR}} and push it onto the stack",
    // still more to do here
}

// replace {{ and }} with the proper HTML tags
for (var key in descDict) {
    if (descDict.hasOwnProperty(key)) {
        descDict[key] = descDict[key].replace(/{{(.*?)}}/g, '<span class="mono">$1</span>');
    }
}

function getDescription(bytecode) {
    var ret = descDict[bytecode.opname];
    if (ret) {
        return ret.replace(/ARGREPR/g, bytecode.argrepr);
    } else {
        return "";
    }
}
