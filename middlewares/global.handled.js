const handleError = (err, req, res, next) => {
    res.status(err['cause']?.status || 500).json(
        {
            message:err.message || 'internal server error',
            errorBody : err.data,
            errorCode: err.code
        }
    )
}