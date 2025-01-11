const Joi = require("joi");

const registerAdminSchema=Joi.object({
    username:Joi.string().min(3).max(50).required(),
    password:Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "store").required(),
})

const loginAdminSchema=Joi.object({
    username:Joi.string().min(3).max(50).required(),
    password:Joi.string().min(6).required(),
    role: Joi.string().valid("admin", "store").required(),
})

const updateAdminSchema=Joi.object({
    username:Joi.string().min(3).max(50).required(),
    password:Joi.string().min(6).optional(),
})

const deleteAdminSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": "ID must be a number",
      "number.integer": "ID must be an integer",
      "any.required": "ID is required",
    }),
    forceDelete: Joi.string().valid("true", "false").optional()
      .messages({
        "any.only": "forceDelete must be either 'true' or 'false'",
      }),
  });

const getAdminbyIdSchema=Joi.object({
    id: Joi.number().integer().required().messages({
        "number.base": "ID must be a number.",
        "number.integer": "ID must be an integer.",
        "any.required": "ID is required.",
      }),
})  

const searchAdminSchema=Joi.object({
    id: Joi.number().integer().optional().messages({
        "number.base": "ID must be a number.",
        "number.integer": "ID must be an integer.",
      }),
      username: Joi.string().trim().optional().messages({
        "string.base": "Username must be a string.",
      }),
      userType: Joi.string().trim().optional().valid("admin", "store").messages({
        "string.base": "User type must be a string.",
        "any.only": "User type must be 'admin' or 'store'.",
      }),
})


// for category
const getCategoryByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const categoryDeleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
  forceDelete: Joi.string().valid("true", "false").optional()
      .messages({
        "any.only": "forceDelete must be either 'true' or 'false'",
      }),
});

const categorySearchSchema = Joi.object({
  id: Joi.number().integer().optional().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
  }),
  title: Joi.string().trim().optional().messages({
    "string.base": "Title must be a string.",
  }),
});

const upsertCategorySchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null, '').optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  title: Joi.string().trim().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
  img: Joi.string().trim().optional().messages({
    "string.base": "Image URL must be a string.",
  })
});


// for product
const getProductByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const ProductDeleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
  forceDelete: Joi.string().valid("true", "false").optional()
      .messages({
        "any.only": "forceDelete must be either 'true' or 'false'",
      }),
});

const ProductSearchSchema = Joi.object({
  id: Joi.number().integer().optional().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
  }),
  title: Joi.string().trim().optional().messages({
    "string.base": "Title must be a string.",
  }),
});

const upsertProductSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null, '').optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  
  title: Joi.string().trim().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),
  
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
  
  img: Joi.string().trim().optional().messages({
    "string.base": "Image URL must be a string.",
  }),
  
  cat_id: Joi.string().trim().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "any.required": "Description is required.",
  }),
});

// for productattribute
const getProductAttributeByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const ProductAttributeDeleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
  forceDelete: Joi.string().valid("true", "false").optional()
      .messages({
        "any.only": "forceDelete must be either 'true' or 'false'",
      }),
});

const ProductAttributeSearchSchema = Joi.object({
  id: Joi.number().integer().optional().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
  }),
  title: Joi.string().trim().optional().messages({
    "string.base": "Title must be a string.",
  }),
});

const upsertProductAttributeSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null, '').optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  
  title: Joi.string().trim().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),
  
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
  
  img: Joi.string().trim().optional().messages({
    "string.base": "Image URL must be a string.",
  }),
  
  cat_id: Joi.string().trim().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "any.required": "Description is required.",
  }),
});

// for productattribute
const ProductImagesByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const ProductImagesDeleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
  forceDelete: Joi.string().valid("true", "false").optional()
      .messages({
        "any.only": "forceDelete must be either 'true' or 'false'",
      }),
});

const ProductImagesSearchSchema = Joi.object({
  id: Joi.number().integer().optional().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
  }),
  title: Joi.string().trim().optional().messages({
    "string.base": "Title must be a string.",
  }),
});

const ProductImagesUpsertSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null, '').optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  
  title: Joi.string().trim().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),
  
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
  
  img: Joi.string().trim().optional().messages({
    "string.base": "Image URL must be a string.",
  }),
  
  cat_id: Joi.string().trim().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "any.required": "Description is required.",
  }),
});

// for Delivery
const getDeliveryByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const DeliveryDeleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
  forceDelete: Joi.string().valid("true", "false").optional()
      .messages({
        "any.only": "forceDelete must be either 'true' or 'false'",
      }),
});


const DeliverySearchSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null, '').optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  
  title: Joi.string().trim().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),
  
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
  
  img: Joi.string().trim().optional().messages({
    "string.base": "Image URL must be a string.",
  }),
  
  cat_id: Joi.string().trim().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "any.required": "Description is required.",
  }),
});


// for faq
const upsertFaqSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null, '').optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  question: Joi.string().trim().required().messages({
    "string.base": "question must be a string.",
    "any.required": "question is required.",
  }),
  answer: Joi.string().trim().required().messages({
    "string.base": "answer must be a string.",
    "any.required": "answer is required.",
  }),
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  })
});

const getFaqIdBySchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const FaqDeleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
  forceDelete: Joi.string().valid("true", "false").optional()
      .messages({
        "any.only": "forceDelete must be either 'true' or 'false'",
      }),
});

const FaqSearchSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null, '').optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  
  question: Joi.string().trim().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),
  answer: Joi.string().trim().required().messages({
    "string.base": "answer must be a string.",
    "any.required": "answer is required.",
  }),
  
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
  
  img: Joi.string().trim().optional().messages({
    "string.base": "Image URL must be a string.",
  }),
  
  cat_id: Joi.string().trim().required().messages({
    "string.base": "Category ID must be a string.",
    "any.required": "Category ID is required.",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "any.required": "Description is required.",
  }),
});

// for Rider
const upsertRiderSchema = Joi.object({
  id: Joi.number().integer().optional().allow(null, '').messages({
    "number.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  store_id: Joi.number().integer().required().messages({
    "number.base": "Store ID must be a number.",
    "any.required": "Store ID is required."
  }),
  img: Joi.string().uri().required().messages({
    "string.base": "Image must be a valid URI.",
    "any.required": "Image is required."
  }),
  title: Joi.string().trim().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required."
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required."
  }),
  ccode: Joi.string().trim().required().messages({
    "string.base": "Country code must be a string.",
    "any.required": "Country code is required."
  }),
  mobile: Joi.string().pattern(/^\d{10,15}$/).required().messages({
    "string.pattern.base": "Mobile must be a valid number with 10 to 15 digits.",
    "any.required": "Mobile is required."
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required."
  }),
  rdate: Joi.date().iso().required().messages({
    "date.base": "Registration date must be a valid ISO date.",
    "any.required": "Registration date is required."
  }),
  status: Joi.number().integer().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required."
  })
});

const getRiderIdBySchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const RiderDeleteSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
  forceDelete: Joi.string().valid("true", "false").optional()
      .messages({
        "any.only": "forceDelete must be either 'true' or 'false'",
      }),
});

const RiderSearchSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null, '').optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  
  title: Joi.string().trim().required().messages({
    "string.base": "Title must be a string.",
    "any.required": "Title is required.",
  }),
  email: Joi.string().trim().required().messages({
    "string.base": "answer must be a string.",
    "any.required": "answer is required.",
  }),
  
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
});

module.exports={registerAdminSchema,loginAdminSchema,updateAdminSchema, deleteAdminSchema,getAdminbyIdSchema,searchAdminSchema,
    getCategoryByIdSchema,categoryDeleteSchema,categorySearchSchema,upsertCategorySchema,
    getProductByIdSchema,ProductDeleteSchema,ProductSearchSchema,upsertProductSchema,
    getProductAttributeByIdSchema,ProductAttributeDeleteSchema,ProductAttributeSearchSchema,upsertProductAttributeSchema,
    ProductImagesByIdSchema,ProductImagesDeleteSchema,ProductImagesSearchSchema,ProductImagesUpsertSchema,
    getDeliveryByIdSchema,DeliveryDeleteSchema,DeliverySearchSchema,
    upsertFaqSchema,getFaqIdBySchema,FaqDeleteSchema,FaqSearchSchema,
    RiderSearchSchema,RiderDeleteSchema,getRiderIdBySchema,upsertRiderSchema
}