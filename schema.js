const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title : Joi.string().required(),
        description : Joi.string().required(),
        location : Joi.string().required(),
        country : Joi.string().required(),
        price : Joi.number().unsafe().required().min(0).max(1000000).messages({
            'number.base': '"listing.price" must be a number',
            'number.unsafe': '"listing.price" must be a safe number',
            'number.min': '"listing.price" must be at least 0',
            'number.max': '"listing.price" must be less than or equal to 1000000',
        }),
        catagory : Joi.string().valid('mountains', 'sea Side', 'forest', 'fram house').optional(),
        image : Joi.alternatives().try(
            Joi.string().allow("", null),
            Joi.object({
                url: Joi.string().allow("", null),
                filename: Joi.string().allow("", null),
            }).unknown(true)
        ).default({ url: "", filename: "listingimage" })
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment : Joi.string().required()
    }).required()
})