function register_tooltip(classname, text) {
    $('.' + classname).attr('title', text);
}

// General Instructions
register_tooltip('NOP', '');
register_tooltip('POP_TOP', '');
register_tooltip('ROT_TWO', '');
register_tooltip('ROT_THREE', '');
register_tooltip('DUP_TOP', '');
register_tooltip('DUP_TOP_TWO', '');
// Unary operations
register_tooltip('UNARY_POSITIVE', '');
register_tooltip('UNARY_NEGATIVE', '');
register_tooltip('UNARY_NOT', '');
register_tooltip('UNARY_INVERT', '');
register_tooltip('GET_ITER', '');

register_tooltip('LOAD_NAME', 'Push the value that name refers to onto the stack');
