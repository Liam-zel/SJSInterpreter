/** 
 * cMathSJS 
*/
let seed = 1

export function rand() {
    // seeding doesnt make the outcomes the same so idk why id do this, 
    // but using certain seeds can change the patterns
    // if (seed == undefined) seed = seed
    seed += (Date.now() % 0.001911)
    seed.toString()

    // turn result into an array of whole numbers
    let accumulate = seed.toString().split("").filter(x => x != ".")

    // accumulate array
    let total = 1
    accumulate.forEach(value => {
        total *= parseInt(value) + 0.1
    })

    let val = total + parseInt(accumulate[0])
    val /= 100

    // lol
    if (val > 1) val -= floor(val)

    return val
}

export function ceil(val) {
    val = val.toString()
    if (val.indexOf('.') != -1) {
        val = val.slice(0, val.indexOf('.'))
        val = parseFloat(val)
        if (val > 0) val += 1
    }

    return parseFloat(val)
}

export function floor(val) {
    val = val.toString()
    if (val.indexOf('.') != -1) {
        val = val.slice(0, val.indexOf('.'))
        val = parseFloat(val)
        if (val < 0) val -= 1
    }

    return parseFloat(val)
}

export function absolute(val) {
    if (val < 0) return val * -1
    return val
}

export function round(val) {
    if (val - floor(val) < 0.5) return floor(val)
    else return ceil(val)
}