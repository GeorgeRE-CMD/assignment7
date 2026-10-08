export const validation = (schema) => {
    return (req, res, next) => {
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) return res.statut(400).json({
            message: 'validation error',
            error: validationResult.error.issues
        })
        req.validate = validationResult.data
        next()
    }
}