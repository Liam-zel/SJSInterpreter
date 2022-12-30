* ball stats
num x = 2
num y = 1
num xVel = 1
num yVel = 1
str ball = O * ball visual

* room dimensions
num width = 15
num height = 5

* infinite loop
lop (num i = 1, (grt i 0), (add i 0)) {
    * update ball
    add x xVel
    add y yVel

    com (gte x width) {
        mul xVel -1
    }
    com (lte x 0) {
        mul xVel -1
    }
    com (gte y height) {
        mul yVel -1
    }
        com (lte y 0) {
        mul yVel -1
    }


    * draw ball
    str offset = [SPACE]

    * vertical offset
    lop (num j = (add [y] 1), (grt j 0), (sub j 1)) {
        con offset [NEWLINE]
    }

    * horizontal offset
    lop (num j = [x], (grt j 0), (sub j 1)) {
        con offset [SPACE]
    }

    con offset [ball]

    clr
    prn [offset] [NEWLINE] [NEWLINE] [NEWLINE]
}