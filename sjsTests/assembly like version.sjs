var x = 1   * 1
mul x 10    * 10
add x 1     * 11

    * im a comment btw, but you HAVE to tab because FUCK YOU

var y       * 0
add y x     * 11
div y 2     * 5.5

var z = 10  * 10
sub z (add y mul x 2) * -17.5
mul (z y) x * -1058.75

com (equ z -1058.75, neq x 10) {
    prn add (add (add "this conditional statement " z) " ") x * this conditional statement -1058.75 11
}

lop (var i = 1, i lst 100, add i 1) {
    add i 1
    sub i 1
}

fnc functionName() {
    var helloWorld = "helloWorld"
    helloWorld = "hello"
    add helloworld " world"
}

 
num x = (add [z] 1)     * square brackets only reads variable and doesnt update

    * variables are instantiated through: var
    * comments are this obviously, with tabs
    * loops are instantiated through: lop
    * functions are instantiated through: fnc
    * arguments are split by: ,
    * lines end when they end
    * instructions are binary 
    * results can be chained through brackets: add 1 (add 1 1) , this returns 3
    * print to console with: prn
    * if states done through comparisons: com
    * comparisons can be:
    *   - equ "equal"
    *   - neq "not equal"
    *   - lst "less than"
    *   - grt "greater than"
    *   - lte "less than or equal to"
    *   - gte "greater than or equal to"