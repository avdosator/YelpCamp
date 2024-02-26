const Joi = require("joi");
const sanitizeHTML = require("sanitize-html");

const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [], // you can add tags and attributes which are allowed
                    allowedAttributes: {}
                });
                // if value is changed that means that string contained some html element and then we return error message for
                // string.escapeHTML key above, and we provide value to be inserted in that message
                if (clean !== value) return helpers.error("string.escapeHTML", { value });
                return clean;
            }
        }
    }

});

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required(),
        location: Joi.string().required(),
        //image: Joi.string().required()
    }).required(),
    deleteImages: Joi.array() // array that will be formed with names of checked images to delete (in edit form)
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});