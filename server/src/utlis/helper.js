
const generateRandomString = (length) =>{

    const char = 'qwertyuioplkjhgfdsazxcvbnm1234567890QWERTYUIOPLKJHGFDSAZXCVBNM'
    const len = char.length
    let random = ''
    for(i=0; i<length; i++){
        const pos = Math.ceil(Math.random()*(len-1))
        random += char[pos]
    }

        return random

}

module.exports = generateRandomString