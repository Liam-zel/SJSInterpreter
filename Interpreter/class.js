import { readFileSync } from 'fs'
import { round, floor, ceil, rand, absolute } from './complexMath.js'

/**
 * Shitty JavaScript (sjs) Interpreter class
 */
export class _Interpreter {   

    /**
     * @param {File} filepath the relative filepath to the sjs file
     */
    constructor(filepath, tickRate) {
        this.program = this.getProgram(filepath)

        this.variables = new Map()

        this.primitives   = ["num", "str"]
        this.math         = ["add", "sub", "mul", "div", "mod", "pow"]
        this.cMath        = ["rnd", "flr", "cel", "ran", "abs"] 
        this.operations   = ["com", "fnc", "lop", "prn", "brk", "con", "clr", "tic"]
        this.logic        = ["equ", "neq", "lst", "grt", "lte", "gte", "not"]
        this.comment      =  "*"

        // when theres an instruction on a line, this is set to true
        // this should hopefully prevent wasted time from low tick rates
        this.lineHadInstruction = false

        this.constants = new Map()
            this.constants.set("TAB", "\t")
            this.constants.set("NEWLINE", "\n")
            this.constants.set("SPACE", "\u0020")
            this.constants.set("NULL", 0)
            this.constants.set("UNDEFINED", undefined)

        this.scopeStart   = "{"
        this.scopeEnd     = "}"
        this.scopeFlag    = "@@"
        this.scopeDepth   = 0

        this.readStart    = "["
        this.readEnd      = "]"

        this.endOfLoopFlag = "endLoop"
        this.operations = this.operations.concat(this.endOfLoopFlag)

        this.tickRate = (tickRate != undefined) ? tickRate : 0

        this.currentLine  = 0

        // when compare statements are false or loops need 
        // to be broken out of etc, the runProgram() function
        // doesnt execute the next skipLines amount of lines
        this.skipLines = 0 

        // reserved keywords, variables and functions etc. cant be named these
        this.reserved = this.primitives.concat(this.math, this.cMath, this.operations,
                                               this.logic, this.comment, this.scopeStart,
                                               this.scopeEnd, this.scopeFlag, this.readStart,
                                               this.readEnd, this.endOfLoopFlag)

        for (let element of this.constants) {
            this.reserved = this.reserved.concat(element[0])
        }
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

        // remove comments and set tick rate
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
        let depth = 0
        for (let i = lineValues.length-1; i >= 0; i--) {
            let line = lineValues[i]
            // keep up to date with current depth level to use for inserted comparisons and breaks
            let checkDepth = line.split(" ")
            // get last string in line and slice off the { or }
            checkDepth = checkDepth[checkDepth.length-1].slice(1)
            // if it has the scope flag, chop it off and update depth with the number at the end
            if (checkDepth.indexOf(this.scopeFlag) !== -1) depth = parseInt(checkDepth.slice(this.scopeFlag.length))

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
            
                let label = this.scopeFlag + (depth+1)
                let newComparison1 = "com (not " + logic + ") " + this.scopeStart + label
                let newComparison2 = "brk " + this.scopeFlag + depth
                let newComparison3 = this.scopeEnd + label

                lineValues.splice(i+2, 0, newComparison1, newComparison2, newComparison3)

                // final step: place endOfLoopFlag and incrementer at end
                let finish = this.scopeEnd + this.scopeFlag + depth
        
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
     * interprets it into Javascript
     */
    runProgram() {
        this.program = this.programCast()
        
        let x = setInterval(() => {   
            // so not to make tickrate seem longer and not to waste time
            while (this.lineHadInstruction === false) {
                let line = this.program[this.currentLine]
                if (this.skipLines === 0) this.interpretLine(line)
                else this.skipLines--

                this.currentLine++

                if (this.currentLine === this.program.length) {
                    clearInterval(x)
                    break;
                }
            }
            
            this.lineHadInstruction = false
        }, this.tickRate);
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
            let value = (instruction === "str")? lineArr.splice(3).join(' ') : lineArr[3]

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

        // complex math
        if (this.cMath.includes(instruction)) {
            let args = line.split(" ")[1]
            args = parseFloat(args)
            returnVal = this.performCMath(instruction, args)
        }

        // complete operations
        if (this.operations.includes(instruction)) {
            let scope = this.getScope(lineArr)
            let args = line.split(" ")
            args = args.slice(1)

            switch (instruction) {
                case "com": // comparison
                    this.comparison(scope, args)
                    break;
                case "brk": // break loop
                    this.break(scope, args)
                    break;
                // case "lop": useless lol
                //     this.loop(scope, args) 
                //     break;
                case this.endOfLoopFlag: // end of loop
                    this.currentLine -= parseInt(args[0])
                    break;
                case "prn": // print to console
                    this.print(args)
                    break;
                case "con": // concat strings
                    returnVal = this.concatenate(args)
                    break;
                case "clr": // clear console
                    this.clear()
                    break;
                case "tic": // set tick rate
                    this.setTickRate(args)
                    break;
            }
        }

        if (returnVal !== {error: "default value"}) this.lineHadInstruction = true
        else this.lineHadInstruction = false

        return returnVal
    }

    /**
     * Isolates instructions in brackets and solves them individually, returning the result
     * @param {String} line 
     * @returns {String} Finished line without brackets
     */
    completeBrackets(line) {
        // no parentheses
        if (line.indexOf("(") === -1) {
            return line
        }

        const insertBetweenBrackets = (str, x, start, end) => {
            return str.slice(0, start) + x + str.slice(end+1, str.length)
        }

        let start = line.indexOf('(')
        let end = line.indexOf(')') 

        let newLine = line.slice(start+1, end)

        // check if open and close brackets are equal in number
        let openCount = newLine.split("").filter(char => char == '(').length
        let closeCount = newLine.split("").filter(char => char == ')').length

        // resolve brackets in correct order:
        /**
         * if there is an open bracket, connect it to the closest closing bracket
         * solve
         * repeat with recursion 
         */
        if (openCount > closeCount) {
            let completeFirst = newLine.slice(newLine.indexOf('(')+1)
            completeFirst = this.interpretLine(completeFirst)
            
            newLine = insertBetweenBrackets(newLine, completeFirst, newLine.indexOf('('), newLine.length)

            let secondHalf = line.slice(end+1)
            newLine += secondHalf.slice(0, secondHalf.lastIndexOf(')'))
            end = line.lastIndexOf(')') 
        }

        let substitute = this.interpretLine(newLine)
        line = insertBetweenBrackets(line, substitute, start, end)

        return line
    }


    /**
     * Gets the scope (code in between { }) for functions, comparisons, loops etc.
     * @param {String} line instruction fed into the function
     * @returns {Array} Array of line strings
     */
    getScope(line) {
        let label = line[line.length-1]
        if (label.indexOf(this.scopeStart) != -1) label = label.slice(label.indexOf(this.scopeStart)+1)
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
            
            
            if (this.program[i].slice(1) === label) return scope;
        }

        return {err: "NO SCOPE FOUND"}
    }

    /**
     * Stores a variable with a name and value in the map _Interpreter.variables
     * @param {String} name name of variable
     * @param {*} value string or number value of variable
     */
    createVariable(name, value) {
        if (this.reserved.includes(name)) {
            return TypeError("RESERVED DUMBASS") 
        }

        // constants and other variables
        if (this.readVariables(value) != "") value = this.readVariables(value)

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
        if (value1.startsWith(this.readStart) && value1.endsWith(this.readEnd)) {
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
        const errObj = {
            lineNum: "line: " + this.program[this.currentLine], 
            instruction: instruction, 
            val1: value1,
            val2: value2
        }
        if (isNaN(value1)) return console.log("ERROR - val1 is NaN", errObj)
        if (isNaN(value2)) return console.log("ERROR - val2 is NaN", errObj)

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
                console.log('ERROR - INVALID MATH OPERATOR')
        }

        // update variable
        if (reference && !readOnly) this.variables.set(reference, result) 

        return result
    }


    /**
     * Runs given input through complex math operations in the complexMath.js file,
     * Includes floor, ceil, round, absolute and random functions
     * @param {String} instruction Math operation such as floor, ceil, rand etc.
     * @param {Number} value Any number input
     * @returns {Number} Returns number output
     */
    performCMath(instruction, val) {
        switch(instruction) {
            case "flr": //  floor
                return floor(val)
            case "cel": //  ceil
                return ceil(val)
            case "rnd": //  round
                return round(val)
            case "ran": //  rand
                return rand()
            case "abs": //  absolute
                return absolute(val)

        }
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
        // input1 = this.getReference(input1)
        // input2 = this.getReference(input2)

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


    /**
     * Skips lines equal to it's scope size
     * @param {Array} scope 
     */
    break(scope) {
        this.skipLines = scope.length
    }

    /**
     * Useless?
     * @param {Array} scope 
     * @param {Array} args 
     */
    loop(scope, args) {
        // useless
    }

    /**
     * If the comparison returns false (args[0]),
     * skipLines = scope.length
     * @param {Array} scope 
     * @param {Array} args 
     */
    comparison(scope, args) {   
        if (args[0].startsWith('false')) {
            this.skipLines = scope.length
        }
        return
    }


    /**
     * Combines any amount of strings and returns the result
     * @param {Array} args inputs that will be combined
     * @returns {String} Concatenated string
     */
    concatenate(args) {
        let origin = args[0]

        // square brackets mean read memory only
        let readOnly = false
        if (origin.startsWith(this.readStart) && origin.endsWith(this.readEnd)) {
            origin = origin.slice(1, origin.length-1)
            
            readOnly = true 
        }
        let reference
        if (this.variables.get(origin) != undefined) {
            reference = origin
            origin = this.variables.get(origin)
        }

        for (let i = 1; i < args.length; i++) {
            origin += " " + args[i]
        }

        if (reference && !readOnly) this.variables.set(reference, origin)

        return origin
    }

    
    /**
     * 
     * @param {String} val 
     * @returns Either the untouched input or the value of a variable if it leads to one
     */
    getReference(val) {
        if (val === undefined) return val // for not statements
        if (!val.startsWith(this.readStart) && !val.endsWith(this.readEnd)) {
            return val
        }

        // remove readStart and readEnd
        val.slice(this.readStart.length, val.length-this.readEnd.length)

        return this.variables.get(val)
    }


    /**
     * Reads in variables that are encompassed in [], 
     * or returns the array given as a string
     * 
     * Also works for numbers
     * @param {Array} args 
     * @returns {String | Number} 
     */
     readVariables(args) {   
        if (typeof args === 'string') {
            args = args.split(" ") 
        }

        let x = ""
        for (let i = 0; i < args.length; i++) {
            let arg = args[i]

            // add variables to string with [x]
            if (arg.startsWith(this.readStart) && arg.endsWith(this.readEnd)) {
                arg = arg.slice(1, arg.length-1)
                if (this.variables.get(arg) != undefined) x += this.variables.get(arg) + " "
                if (this.constants.get(arg) != undefined) x += this.constants.get(arg) + " "
            }
            // else just add to string
            else x += arg + " "
        }

        x = x.slice(0, x.length-1)

        if (parseFloat(x)) x = parseFloat(x)
        return x
    }

    /**
     * 
     * @param {Array} args array which will be combined and printed to the console
     * 
     * Prints to the console with the prefix - PROGRAM:
     */
    print(args) {
        let printout = ""

        printout = this.readVariables(args)

        let loop = printout.toString().split(" ")
        for (let i = 0; i < loop.length; i++) {
            let arg = loop[i].slice(1, loop[i].length-1)
            if (this.variables.get(arg) != undefined) loop[i] = this.variables.get(arg)
            if (this.constants.get(arg) != undefined) loop[i] = this.constants.get(arg)
        }
        printout = loop.join(" ")

        console.log(`PROGRAM: ${printout}`)
    }

    /**
     * Clears the console
     */
    clear() {
        console.clear()
    }


    /**
     * @returns console log of stored _Interpreter variables
     */
    printVariables() {
        return console.log("\n\nvar: ", this.variables)
    }
} 
