class apiresponse{
    constructor(statusCode, data, message = "Sucess"){
        this.status = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}
//module.exports = apiresponse;