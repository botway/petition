exports.helpers = {
    toLowerCase: function(str) {
        return str.toLowerCase();
    },
    toUpperCase: function(str) {
        return str.toUpperCase();
    },
    equal: function(a, b, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (a != b) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    }
};
