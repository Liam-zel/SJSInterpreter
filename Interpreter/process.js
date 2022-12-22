const { _Interpreter } = require('./class')

const I = new _Interpreter("sjsTests/assembly sjs step.sjs")
I.runProgram() 

I.printVariables()