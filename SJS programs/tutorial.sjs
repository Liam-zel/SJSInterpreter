* This is a comment! lets start

* there are number and string variables
num numberVariable = 1
str stringVariable = hello world!

* you can perform operations on number variables such as
num test = 1

add test 10  * 11
sub test 2   * 9
mul test 4   * 36

* these are the math operations:
    * add - addition, 
    * sub - subtraction, 
    * mul - multiplication, 
    * div - division, 
    * mod - modulus,
    * pow - powers, exponentials


* these operations update the first argument if its a variable, for instance:
num x = 0
add x 1 * will make x == 1
add 1 x * will not make x == 2


* You may have noticed only 2 numbers were passed in
* ALL MATH OPERATIONS TAKE TWO NUMBERS, no more, no less


* You can reassign variables by recreating them:
str a = ha
str a = haha
str a = hahaha


* this language has lots of logic which works like the math operations
* although if they or any other operation that returns are result are an argument, they have to be in brackets
num equals5 = 5

prn (equ equals5 5) * prints true to the console
prn (not (equ equals5 5)) * prints false to the console

* all logic:
    * equ - equal, 
    * neq - not equal
    * lst - less than
    * grt - greater than
    * lte - less than or equal to
    * gte - greater than or equal to
    * not - not (returns opposite of what it is given)


* This language supports loops (lop) and comparisons (com)

* example loop: (prints the numbers 0 - 9 to the console)
lop (num i = 0, (lst i 10), (add i 1)) {
    prn [i]
}

* example comparison: 
* (prints wether a person is an adult or minor based off of age)
num age = 16
com (gte age 18) { 
    prn person is an adult
}
com (lst age 18) {
    prn person is a minor
}


* the language also supports chaining of returns such as:
num lotsOfOnes = (add (add 1 1) (add 1 (add 1 (add (add 1 1) 1)))) * lotsOfOnes === 7
prn HOLY CRAP THATS A LOT OF ONES, I THINK THATS LIKE [lotsOfOnes] ONES?

* or
com (not (equ 6 (sub [lotsOfOnes] 1))){
    prn (not (equ 6 (sub [lotsOfOnes] 1))) * prints true if comparison is true, otherwise doesnt print of course
}

* Thats everything!