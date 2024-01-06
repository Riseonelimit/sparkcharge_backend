const asyncHandler = (requestHandler) => {
//requestHandler is a function that takes in req, res, next
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).
        //if requestHandler returns a promise, resolve it
        catch((err)=>next(err))
        //if requestHandler throws an error, pass it to next()
    }
}



module.exports = asyncHandler
//Export asyncHandler