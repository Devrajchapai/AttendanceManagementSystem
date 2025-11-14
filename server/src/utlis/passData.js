class sharedData {
    constructor(){
        this.data ={};
    }

    setData(key, value){
        this.data[key] = value
    }

    getData(key){
        return this.data[key]
    }

}


module.exports = new sharedData();