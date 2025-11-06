
const hourToMillisecond = (hour, minutes)=>{
        const inSeconds = ((hour*60*60)+minutes*60)
        const inMillisecond = inSeconds * 1000
        
        return inMillisecond
    }



module.exports = hourToMillisecond
