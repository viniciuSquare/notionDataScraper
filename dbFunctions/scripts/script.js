function getNotionFunction(functionString) {
    validateFunctionParentheses(functionString);
    functionString = functionString.replace(/\s/g, "")
    console.log(functionString);
}

function validateFunctionParentheses(functionString) {
    let count = 0;

    [...functionString].forEach( letter => {
        if(letter == '(' || letter == ')') {
            count++
        }
    })
    if(count % 2 != 0) console.log('Error, '+ count + ' parentheses')
    console.log(count)
}
module.exports = {
    getNotionFunction
 }