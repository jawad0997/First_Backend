const asycHandler = (reqHandler) => {
  return (req,res,next) => {
    promise.resolve(reqHandler(req,res,next)).catch((err) => next(error))
  }
}



export {asycHandler}



/*//with try catch
const asynchandler = (func) => async (req,res,next) => {
  try {
    await func(req,res,next)
} catch (err) {
	res.status(err.code || 500).json({
    success:false,
    message: err.message
  })
}
}*/