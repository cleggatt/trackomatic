jasmine.Spec.prototype.tbd = function () {
    this.fail("Unimplemented specification");
};

beforeEach(function() {
    this.addMatchers({
        toBeEmpty : function() {
            return (this.actual instanceof Array) && (this.actual.length == 0);
        }
    });
});