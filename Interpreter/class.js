const { readFileSync } = require('fs')

/**
 * Shitty JavaScript (sjs) Interpreter class
 */
class _Interpreter {   

    /**
     * @param {File} filepath the relative filepath to the sjs file
     */
    constructor(filepath) {
        this.program = this.getProgram(filepath)

        this.variables = new Map()

        this.primitives   = ["num", "str"]
        this.math         = ["add", "sub", "mul", "div", "mod", "pow"]
        this.operations   = ["com", "fnc", "lop", "prn", "brk", "con"]
        this.logic        = ["equ", "neq", "lst", "grt", "lte", "gte", "not"]
        this.comment      =  "*"

        this.scopeStart   = "{"
        this.scopeEnd     = "}"
        this.scopeFlag    = "@@"
        this.scopeDepth   = 0

        this.endOfLoopFlag = "endLoop"
        this.operations += this.endOfLoopFlag

        this.currentLine  = 0

        // when compare statements are false or loops need 
        // to be broken out of etc, the runProgram() function
        // doesnt execute the next skipLines amount of lines
        this.skipLines = 0 

        // reserved keywords, variables and functions etc. cant be named these
        this.reserved = this.primitives.concat(this.math)
                                       .concat(this.operations)
                                       .concat(this.logic)
                                       .concat(this.comment)
                                       .concat(this.scopeStart)
                                       .concat(this.scopeEnd)
                                       .concat(this.scopeFlag)
    }

    /**
     * @param {File} filepath the filepath of the file
     */
    getProgram(filepath) {
        return readFileSync(filepath, 'utf-8')
    }

    /**
     * turns the text file into an array of strings to be read by the interpreter.
     * Also removes comments, unecessary whitespace and adds scope flags
     * @var {String} lineValues
     * @returns Array of individual lines filtering out whitespace and comments
     */
    programCast() {
        // split each line into a seperate string in an array, 
        let lineValues = this.program.split("\n")

        // remove comments
        for (let i = 0; i < lineValues.length; i++) {
            let line = lineValues[i]
            let commentPos = (line.indexOf(this.comment) > -1) ? line.indexOf(this.comment) : line.length
            let finalLine = line.slice(0, commentPos)

            lineValues[i] = finalLine.trim()
        }
    
        // remove empty lines
        lineValues = lineValues.filter(line => line.trim().length > 0)

        // add labels to scope starts and ends
        for (let i = 0; i < lineValues.length; i++) {
            if (lineValues[i].endsWith(this.scopeStart)) {
                lineValues[i] += this.scopeFlag + this.scopeDepth
                this.scopeDepth++
            }
            if (lineValues[i].startsWith(this.scopeEnd)) {
                this.scopeDepth--
                lineValues[i] += this.scopeFlag + this.scopeDepth
            }
        }

        // break apart loops 
        for (let i = lineValues.length-1; i >= 0; i--) {
            let line = lineValues[i]

            if (line.startsWith("lop")) {
                // step 1, move variable initialisation outside loop
                let params = line.split(" ").filter(element => element != "").join(" ")
                params = params.slice(params.indexOf('(') + 1)

                let end = params.indexOf(',')
                
                let loopVar = params.slice(0, end)
                loopVar = loopVar.trim()

                // step 2, turn logic into comparison
                let logic = params.slice(params.indexOf('(') + 1)
                logic = params.slice(params.indexOf(',')+1, params.lastIndexOf(','))
                logic = logic.trim()


                // step 3, increment
                let increment = params.slice(params.lastIndexOf(',')+1, params.lastIndexOf(')')-1)
                increment = increment.trim().slice(1)

                // get rid of parameters from loop
                let newLoop = line.slice(0, 3) + " " + line.slice(line.indexOf(this.scopeStart))
                lineValues[i] = newLoop

                // place variable before loop
                lineValues.splice(i, 0,loopVar)

                // place comparison at the start of the loop
                let label = this.scopeFlag + (this.scopeDepth+1)
                let newComparison1 = "com (not " + logic + ") " + this.scopeStart + label
                let newComparison2 = "brk"
                let newComparison3 = this.scopeEnd + label

                lineValues.splice(i+2, 0, newComparison1, newComparison2, newComparison3)

                // final step: place endOfLoopFlag and incrementer at end
                label = this.scopeFlag + this.scopeDepth
                let finish = this.scopeEnd + label
        
                // find end
                for (let j = i; j < lineValues.length; j++) {
                    let line = lineValues[j]

                    // end is found, now insert flag and incrementer
                    if (line === finish) {
                        lineValues.splice(j, 0, this.endOfLoopFlag + " " + (j-i))
                        lineValues.splice(j, 0, increment)
                        break;
                    }// nice amount of nesting :)))
                }
            }
        }

        return lineValues
    }
    
    /**
     * Runs through the program line by line and 
     * interprets it
     */
    runProgram() {
        this.program = this.programCast()

        for (this.currentLine = 0; 
             this.currentLine < this.program.length; 
             this.currentLine++) {

            let line = this.program[this.currentLine]
            if (this.skipLines === 0) this.interpretLine(line)
            else this.skipLines--
        }
    }


    /**
     * Brains of the operation, completes brackets and resolves all programming
     * @param {String} line A string of the current line
     */
    interpretLine(line) {
        line = this.completeBrackets(line)

        // splits line into sections
        let lineArr = line.split(" ") 

        const instruction = lineArr[0]

        let returnVal = {error: "default value"}

        // create variable
        if (this.primitives.includes(instruction)) {
            let name = lineArr[1]
            // by default it is treated as string, otherwise turn it into a number
            let value = (instruction === "str")? lineArr.splice(3).join(' ') : parseFloat(lineArr[3])

            this.createVariable(name, value)
        }
        // do math
        if (this.math.includes(instruction)) {
            let operation = lineArr[0]
            let value1 = lineArr[1]
            let value2 = lineArr[2]

            returnVal = this.solveMath(operation, value1, value2)
        }
        // resolve logic
        if (this.logic.includes(instruction)) {
            let comparison = instruction
            let input1 = lineArr[1]
            let input2 = lineArr[2]

            returnVal = this.resolveLogic(comparison, input1, input2)
        }
        // complete operations
        if (this.operations.includes(instruction)) {
            let scope = this.getScope(lineArr)
            let args = line.split(" ")
            args = args.slice(1)

            switch (instruction) {
                case "com":
                    this.comparison(scope, args)
                    break;
                case "brk":
                    this.break(scope, args)
                    break;
                // case "lop": useless lol
                //     this.loop(scope, args) 
                //     break;
                case this.endOfLoopFlag:
                    this.currentLine -= parseInt(args[0])
                    break;
                case "prn":
                    this.print(args)
                    break;
                case "con":
                    returnVal = this.concatenate(args)
                    break;
            }
        }

        return returnVal
    }

    /**
     * Isolates instructions in brackets and solves them individually, returning the result
     * @param {String} line 
     * @returns {String} Finished line without brackets
     */
    completeBrackets(line) {
        if (line.indexOf('(') !== -1) {
            let start = line.indexOf('(')
            let end = line.lastIndexOf(')')

            let newLine = line.slice(start+1, end)

            let substitute = this.interpretLine(newLine)
            line = line.slice(0, start) + substitute + line.slice(end+1, line.length)
        }
        return line
    }


    /**
     * Gets the scope (code in between { }) for functions, comparisons, loops etc.
     * @param {String} line instruction fed into the function
     * @returns {Array} Array of line strings
     */
    getScope(line) {
        let label = line[line.length-1].slice(1)
        let index = this.currentLine

        // assumption for loops
        if (line[0] === 'lop') {
            for (let i = index; i >= 0; i--) {
                if (this.program[i].startsWith("lop")) {
                    label = this.program[i].slice(this.program[i].indexOf(this.scopeStart) + 1)

                    index = i
                }
            }
        }
        let scope = []

        // gets code in scope + scopeEnd line
        for (let i = index+1; i < this.program.length; i++) {
            scope.push(this.program[i])
            
            if (this.program[i].slice(1) === label) break;
        }

        return scope
    }

    /**
     * Stores a variable with a name and value in the map _Interpreter.variables
     * @param {String} name name of variable
     * @param {*} value string or number value of variable
     */
    createVariable(name, value) {
        if (this.reserved.includes(name)) {
            console.log("RESERVED DUMBASS") // do something with this later
        }

        if (this.variables.get(value) != undefined) value = this.variables.get(value)

        this.variables.set(name, value)
    }


    /**
     * @param {String} instruction the maths operation being performed
     * @param {*} value1 Variable name reference or value
     * @param {*} value2 Variable name reference or value
     * @returns Result of math operation and updates value1 if reference is given
     */
    solveMath(instruction, value1, value2) {
        // square brackets mean read memory only
        let readOnly = false
        if (value1.startsWith('[') && value1.endsWith(']')) {
            value1 = value1.slice(1, value1.length-1)
            readOnly = true
        }

        let reference
        if (this.variables.get(value1) != undefined) {
            reference = value1
            value1 = this.variables.get(value1)
        }
        if (this.variables.get(value2) != undefined) {
            value2 = this.variables.get(value2)
        }  

        value1 = parseFloat(value1)
        value2 = parseFloat(value2) 

        // error handling
        if (isNaN(value1)) return console.log("ERROR - val1 is NAN")
        if (isNaN(value2)) return console.log("ERROR - val2 is NAN")

        let result = 0
        switch (instruction) {
            case "add":
                result = value1 + value2
                break;
            case "sub":
                result = value1 - value2
                break;
            case "mul":
                result = value1 * value2
                break;
            case "div":
                result = value1 / value2
                break;
            case "mod":
                result = value1 % value2
                break;
            case "pow":
                result = Math.pow(value1, value2)
                break;
            default:
                console.log('INVALID MATH OPERATOR')
        }

        // update variable
        if (reference && !readOnly) this.variables.set(reference, result) 

        return result
    }


    /**
     * @param {String} comparison logic comparison to make between input 1 and 2
     * @param {*} input1 string, number or variable reference
     * @param {*} input2 string, number or variable reference
     * @returns A bool based on logic and inputs
     */
    resolveLogic(comparison, input1, input2) {
        // if references, grab variable values
        if (this.variables.get(input1) != undefined) input1 = this.variables.get(input1)
        if (this.variables.get(input2) != undefined) input2 = this.variables.get(input2)

        switch (comparison) {
            case "equ": //equal
                return (input1 == input2)
            case "neq": //not equal
                return (input1 != input2)
            case "lst": //less than
                return (input1 < input2)
            case "grt": //greater than
                return (input1 > input2)
            case "lte": //less than or equal to
                return (input1 <= input2)
            case "gte": //greater than or eqaul to
                return (input1 >= input2)
            case "not": 
                return (input1 == 'false')

        }
    }


    break(scope) {
        this.skipLines = scope.length
    }

    loop(scope, args) {
        // useless
    }

    comparison(scope, args) {   
        if (args[0] === 'false') {
            this.skipLines = scope.length
        }
        return
    }


    concatenate(args) {
        let origin = args[0]

        // square brackets mean read memory only
        let readOnly = false
        if (origin.startsWith('[') && origin.endsWith(']')) {
            origin = origin.slice(1, origin.length-1)
            readOnly = true
        }
        let reference
        if (this.variables.get(origin) != undefined) {
            reference = origin
            origin = this.variables.get(origin)
        }

        for (let i = 1; i < args.length; i++) {
            origin += args[i]
        }

        if (reference && !readOnly) this.variables.set(reference, origin)

        return origin
    }

    print(args) {
        let printout = ""

        args.forEach(arg => {
            if (this.variables.get(arg) != undefined) printout += this.variables.get(arg) + " "
            else printout += arg + " "
        });

        console.log(`PROGRAM: ${printout}`)
    }



    /**
     * @returns console log of stored _Interpreter variables
     */
    printVariables() {
        return console.log("var: ", this.variables)
    }
} 

module.exports = {_Interpreter}