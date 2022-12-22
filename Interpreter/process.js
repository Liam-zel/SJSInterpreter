const { _Interpreter } = require('./class')

const I = new _Interpreter("SJS programs/fizzbuzz.sjs")
I.runProgram() 

I.printVariables()