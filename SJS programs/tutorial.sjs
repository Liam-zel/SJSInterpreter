* Welcome to the Shitty JavaScript tutorial
* Anything after a '*' is a comment and wont be Interpreted
* Let's start!


* ---------- Create Variables ----------
num numberVariable = 100
num stringVariable = this is a string


* ---------- Print to Console ----------
prn hello world!

* if you want to print a variable, enclose it with []
prn Heres a string: [stringVariable]
prn [numberVariable] is a number variable!


* ---------- Math ----------
add numberVariable 10 * numberVariable now equals 110

* A theme with this language is to write the operation first, then the arguments
* math operations only take two number inputs and no more!
num x = 1
mul x 2     * x == 2
div x 10    * x == 0.2
sub x -19.8 * x == 20
mod x 3     * x == 2
pow x 8     * x == 256


* ---------- Extended Math ----------
* extended math variables might not take any parameters or only take one
num x = 10.123985 * if you want to set an existing variable to something, this is a goto method
cel x   * ceil, x == 11

num x = -14
abs x   * absolute, x == 14

* random, returns a 0 - 1 random number seeded by the value of 'x', 
* you'll see how to use this in the brackets section
ran x       

num x = 1.5
rnd x   * round, x == 2

num x = 99.999
flr x   * floor, x == 99


* ---------- Brackets ----------
prn [NEWLINE]--- Brackets ---

* brackets are the most important concept in sjs, 
* they allow you to run operations inside of operations e.g
num x = (add 1 1) * x == 2

* brackets are done in order and can be stacked infinitely!
num x = (add 1 (add 1 (add 1 (add 1 (add 1 (add 1 (add (add 1 2) 1)))))))
prn All those brackets add to [x] * x == 10

* you can put any operation inside brackets
num x = (ran) * random number between 0 - 1

* brackets can be anywhere!
prn (add 2 3) The 5 was made by an add operation mid-print!


* ---------- Read Only Variables ----------
prn [NEWLINE]--- Read Only Variable ---

* So you might have noticed all operations thus far overwrites the first variable 
* it's given. To prevent this, you can surround the variable name in [ ]
* variables surrounded by [ ] means their value won't be updated during operations!
num x = 9
mul [x] 999999 
prn [x] * still prints 9


* ---------- Comparisons and Logic Cheatsheet ----------
prn [NEWLINE]--- Comparisons and Logic ---
* comparisons are the if statements of sjs, here's an example
num x == 1
com (equ x 1) {
    prn X is equal to 1!
}

* there are many logic statements in sjs:
    * equ: returns true if both inputs are equal
    * neq: returns true if input 1 is not equal to input 2
    * lst: returns true if input 1 is less than input 2
    * lte: returns true if input 1 is less than or equal to input 2
    * grt: returns true if input 1 is greater than input 2
    * gte: returns true if input 1 is greater than or equal to input 2
    * or: returns true if at least one input is true
    * and: returns true if both inputs are true
    * not: inverts given singular input

* Here's some more examples!
num x = 5
com (and (lst x 10) (grt x 0)) {
    prn X is in between 0-10
}
com (neq x 4) {
    prn X is not equal to 4
}
com (not (false)) {
    prn not false == true!
}
com (or (equ x 2) (equ x 3)) {
    prn this won't print because x isn't equal to 2 or 3!
}


* ---------- Loops ----------
prn [NEWLINE]--- Loops ---

* SJS loops are incredibly similar to js loops, being made up of a number variable,
* a terminating condition and an incrementor, being seperated by a ','
* loops can be started with either 'lop', 'for', 'rep' or 'whl'

* This loop prints the numbers 1-10 to the console
lop (num i = 1, lte i 10, add i 1) {
    prn [i]
}

* Loops can be broken with the 'brk' statement
lop (num i = 0, lst i 10000000, add i 0.1) {
    brk
    prn [i] * wont print because loop has been broken
}

* If you need an infinite loop simply use a condition that'll never reach
lop (num i = 1, grt i 0, add i 1) {
    * if not for this break statement, this would loop indefinitely
    com (equ i 100) {
        brk
    }
}


* ---------- Concatenating Strings ----------
prn [NEWLINE]--- Concatenating Strings ---

* If you ever want to combine many strings, characters or numbers together in one string, use the con operation.
str x = hello
con x world 
prn [x] * will print helloworld

* if you want spaces you can manually add them 
str x = (con hello  world)
prn fixed: [x]

* If the first input is a variable, it will be overwritten unless [] are used
str x = Hi my name is 
con [x] Liam
prn [x] * will just print "Hi my name is"


* ---------- Built-In Constants ----------
* currently there is no way to create a constant variable in sjs
* but sjs itself comes with some helpful constants such as:
    * [NEWLINE] = "\n"
    * [NEWSEGMENT] = "\n\n\n\n"
    * [TAB] = "\t"
    * [NULL] = null 

* there are a few more, they can be seen in the constructor for the 
* _Interpreter class in Interpreter/class.js


* ---------- Functions ----------
prn [NEWLINE]--- Functions ---

* functions are similar to js, however functions cant be given parameters, 
* but all variables are global

* functions are called using the run operation, you can run a funtion 
* before the function is even created

num x = 10
run makeX100 * function is defined below but still runs
prn [x] * prints 100

fnc makeX100 {
    num x = 100
}

* functions can also return values using the rtn operation
fnc isXTrue {
    com (equ x true) {
        rtn 1
    }
    com (equ x false) {
        rtn 0
    }

    * if neither comparisons return true
    rtn x isn't true or false, x is [x]
}

str x = true
prn (run isXTrue) * prints 1
str x = false
prn (run isXTrue) * prints 2
str x = tralse
prn (run isXTrue) * prints 'x isn't true or false, x is tralse'


* functions can also be broken out of
fnc breakFunction {
    prn before break
    brk
    prn after break * won't print
}


* ---------- Styling Print ----------
prn [NEWLINE]--- Styling Print ---

* In sjs, you can easily style what print operations look like using the style operation
* Style takes up to 3 arguments, text colour, background colour, and if the text is bold or not
style cyan yellow 1
prn what are these colours?

* styling stays permanent until it is reset, 
* you can reset styling by using the 'default' or 'reset' parameters

prn this is still using those awful colours!
style reset reset 0
prn thats better

* If you only want a background, or text with bold and no background, 'reset' and 'default' can also be used
style default yellow
prn YELLOW

style default default 0     * same as 'style reset reset 0'


* ---------- Benchmarking ----------
prn [NEWLINE]--- Benchmarking ---

* sjs is a very slow language and runs line by line, but if you for some reason
* ever want to see how long your code takes, you can use the time operation

* Use time and give it a name, next time you call time with the same label
* it will return the elapsed time in ms since it was INITIALISED

time label 
for (num i = 0, lst i 1000, add i 1) {

}
prn 1 loop took: (time label)ms * might be around 8-14ms

for (num i = 0, lst i 1000, add i 1) {

}
prn 2 loops took: (time label)ms * might be around 16-28ms


* ---------- Exiting The Program ----------

* If you've had enough of your sjs progam, you can use the ext operation.
* Using ext will immediately end execution of the program
* you can provide an exit message after using the command

ext That's all for the tutorial!


* ---------- Side Notes ----------

* - CLEAR SCREEN: the 'clr' operation clears the console screen, good for animations

* - timers, variables and functions are stored seperately and can have the same name

* - if there's ever an error, hopefully a red error message with information will 
*   be thrown, the program will continue to run unless its a js error

* - when you create the interpreter object in js, after you pass in the filepath, 
*   you can pass in a tickspeed which controls how long it takes the interpreter
*   to run an instruction
*   - this tickspeed doesn't occur when running functions

* - heres all the styles
* text and background: black, red, green, yellow, blue, magenta, cyan, white, grey, gray
*                bold: 0, 1, true, false

* - Look through the SJS programs folder for more useless
*   - Keep in mind, functions didnt exist until fibonacci and disarium numbers, thats why they all suck



* The tutorial is done! hopefully you can refer to it if you are ever stuck!
* And if you can't the interpreter code is always there :))))