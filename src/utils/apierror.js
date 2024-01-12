class apierror extends Error {
    constructor(statusCode, message= "Something went wrong", stack= "") {
        super(message)
        this.statusCode = statusCode
        this.data = message
        this.message = message
        this.sucess = false

        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
//Create a class apierror that extends Error providing consistent information about the nature of the error

module.exports = apierror
//Export apierror