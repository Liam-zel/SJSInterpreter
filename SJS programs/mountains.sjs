str flat = _
str rise = ⟋  
str drop = ⟍

num scale = 3

*     _
*   _/ \      _/\__/\_
*__/    \_/\_/        \
  

num prevY = (flr (mul (ran ) scale))
num currentY = (flr (mul (ran ) scale))
num nextY = (flr (mul (ran ) scale))

* each layer, 1 is bottom, 3 is top
str mountain0 = 
str mountain1 =
str mountain2 =
str mountain3 =
num layer = 1

lop (num i = 0, (lst i 40), (add i 1)) {

   * rise
   com (grt nextY currentY) {
      com (equ layer 0) {
         con mountain0  [rise]
         con mountain1  [SPACE]
         con mountain2  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 1) {
         con mountain0  [SPACE]
         con mountain1  [rise]
         con mountain2  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 2) {
         con mountain0  [SPACE]
         con mountain2  [rise]
         con mountain1  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 3) {
         con mountain0  [SPACE]
         con mountain3  [rise]
         con mountain1  [SPACE]
         con mountain2  [SPACE]
      }

      add layer 1
   }

   * flat land
   com (or (or (equ currentY nextY) (equ currentY prevY)) (and (neq currentY nextY) (neq currentY prevY))) {
      com (equ layer 0) {
         con mountain0  [flat]
         con mountain1  [SPACE]
         con mountain2  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 1) {
         con mountain0  [SPACE]
         con mountain1  [flat]
         con mountain2  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 2) {
         con mountain0  [SPACE]
         con mountain2  [flat]
         con mountain1  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 3) {
         con mountain0  [SPACE]
         con mountain3  [flat]
         con mountain1  [SPACE]
         con mountain2  [SPACE]
      }

   }

   * drop
   com (lst currentY prevY) {
      sub layer 1

      com (equ layer 0) {
         con mountain0  [drop]
         con mountain1  [SPACE]
         con mountain2  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 1) {
         con mountain0  [SPACE]
         con mountain1  [drop]
         con mountain2  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 2) {
         con mountain0  [SPACE]
         con mountain2  [drop]
         con mountain1  [SPACE]
         con mountain3  [SPACE]
      }
      com (equ layer 3) {
         con mountain0  [SPACE]
         con mountain3  [drop] 
         con mountain1  [SPACE]
         con mountain2  [SPACE]
      }
   }

   num prevY = [currentY]
   num currentY = [nextY]
   num nextY = (flr (mul (ran) scale))
}

prn [NEWSEGMENT]
style green white 1
prn [mountain3]
prn [mountain2]
prn [mountain1]
prn [mountain0]