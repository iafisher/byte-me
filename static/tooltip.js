
// General Instructions
function registerTooltips(){
    registerTooltip('NOP', '');
    registerTooltip('POP_TOP', '');
    registerTooltip('ROT_TWO', '');
    registerTooltip('ROT_THREE', '');
    registerTooltip('DUP_TOP', '');
    registerTooltip('DUP_TOP_TWO', '');
    // Unary operations
    registerTooltip('UNARY_POSITIVE', '');
    registerTooltip('UNARY_NEGATIVE', '');
    registerTooltip('UNARY_NOT', '');
    registerTooltip('UNARY_INVERT', '');
    registerTooltip('GET_ITER', '');
    registerTooltip('LOAD_NAME', 'Push the value that name refers to onto the stack');
}

function registerTooltip(classname, text) {
    $('.' + classname).attr('title', text);
}
