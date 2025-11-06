const currentTime = () =>{
    const date = new Date()
    let hour = date.getHours()
    let minutes = String(date.getMinutes()).padStart(2, '0')

    let ampm = hour >= 12 ? 'pm' : 'am'

    hour = hour % 12 

    hour = hour ? hour : 12
    let formatedHour = String(hour).padStart(2, '0') 
    return `${formatedHour}:${minutes} ${ampm}`

}

module.exports = currentTime