class apierror extends Error {
    constructor(statusCode, message= "Something went wrong", errors= [], stack= "") {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.sucess = false
        this.errors = errors

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