class apiresponse{
    constructor(statusCode, data, message = "Success"){
        this.status = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}
//Provides a convenient way to create consistent and structured API responses

module.exports = apiresponse
//Export ApiResponse Class