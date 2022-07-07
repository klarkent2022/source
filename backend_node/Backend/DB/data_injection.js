exports.escapeHTML = function (str) {
    let val = '';
    if (typeof str === 'undefined')
        val = '';
    else
        val = str;

    return (function () {
        let entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "\\": '\\\\'
        };

        //return function(str) {
        return String(val).replace(/[&<>"'\\]/g, function (s) {
            return entityMap[s];
        });

        //};
    })();
};