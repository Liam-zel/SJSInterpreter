* disarium numbers are numbers where if you add their digits raised to the power
* of their position, it still equals the number
* shit explanation heres an example
* 89 = 8^1 + 9^2, 89 is disarium
* 175 = 1^1 + 7^2 + 5^2, 175 is disarium
* 15 != 1^1 + 5^2, 15 is not disarium

fnc checkDisarium {
    num nTemp = [n] * store temporary value of n

    num accumulate = 0 * accumulates the digits^exponent
    num digit = 1 * exponent

    * infinite loop
    for (num i = 0, grt i -1, add i 1) {
        num x = [nTemp]

        * divide by 10^i until the number is < 1
        div x (pow 10 i) 

        com (lst x 1) {
            mul x 10 * make number > 1
            flr x * cut off decimal to get single digit number

            add accumulate (pow [x] digit)
            add digit 1

            * get it back to its old place value
            mul x (pow 10 (sub [i] 1))
            sub nTemp x * subtract nTemp by x to go down a step (e.g 166 - 100 = 66)
            num i = 0 * resets exponent
        }

        * if nTemp === 0, there are no more numbers, check if its disarium
        com (equ nTemp 0) {
            style yellow default 1

            com (equ n accumulate) {
                prn [n] is a disarium number!
            }
            com (and (neq n accumulate) (equ showNotDisarium true)) {
                prn [n] is not a disarium number
            }
            brk
        }
    }
}

* find disarium numbers between 1 - 1000
str showNotDisarium = false * if true, will also print wether a number isn't disarium
for (num n = 1, lte n 1000, add n 1) {
    run checkDisarium
}