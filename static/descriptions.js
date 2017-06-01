var descDict = {
    LOAD_CONST: "Push {{ARGREPR}} onto the stack",
    STORE_NAME: "Pop the top value off the stack and store it as {{ARGREPR}}",
    LOAD_NAME: "Retrieve the value stored as {{ARGREPR}} and push it onto the stack",
    BINARY_ADD: "Pop the top two values off the stack and push their sum",
}

function getDescription(bytecode) {
    var ret = descDict[bytecode.opname];
    if (ret) {
        return ret.replace(/{{ARGREPR}}/g, '<span class="mono">' + bytecode.argrepr + '</span>');
    } else {
        return "";
    }
}
