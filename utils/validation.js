const Joi = require("joi");

const registerAdminSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "store").required(),
})

const loginAdminSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "store").required(),
})

const updateAdminSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).optional(),
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

const getAdminbyIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
})

const searchAdminSchema = Joi.object({
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
  cover: Joi.string().trim().required().messages({
    "string.base": "cover must be a string.",
    "any.required": "cover is required.",
  }),
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
  img: Joi.string().trim().optional().messages({
    "string.base": "Image URL must be a string.",
  })
});

const categoryToggleStatus=Joi.object({
  id:Joi.number().integer().required().messages({
    "number.base":"ID must be a number",
    "number.integer":"ID must be an integer",
    "any.required":"ID is required"
  }),
  value:Joi.string().valid("status").required().messages({
    "any.required":"value required"
  })
})

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

  discount: Joi.number().required().messages({
    "number.base": "Discount must be a valid number.",
    "any.required": "Discount is required.",
  }),

  normal_price: Joi.string().pattern(/^(\d+(\.\d{1,2})?)$/).required().messages({
    "string.pattern.base": "Normal price must be a valid number with up to two decimal places (e.g., 11.00, 11).",
    "any.required": "Normal price is required.",
  }),

  subscribe_price: Joi.string().pattern(/^(\d+(\.\d{1,2})?)$/).optional().messages({
    "string.pattern.base": "Subscription price must be a valid number with up to two decimal places (e.g., 11.00, 11).",
  }),

  subscription_required: Joi.string().valid(0,1).required().messages({
    "any.only": "Subscription required must be 'yes' or 'no'.",
    "any.required": "Subscription required is required.",
  }),

  outOf_Stock: Joi.string().valid(0,1).required().messages({
    "any.only": "Out of Stock must be 'yes' or 'no'.",
    "any.required": "Out of Stock status is required.",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "any.required": "Description is required.",
  }),
  ext_img: Joi.string().trim().optional().messages({
    "string.base": "multiple image URL must be a string.",
  }),
})

const productToggleStatusSchema=Joi.object({
  id:Joi.number().integer().required().messages({
    "number.base":"ID must be a number",
    "number.integer":"ID must be an integer",
    "any.required":"ID is required"
  }),
  value:Joi.string().valid("status").required().messages({
    "any.required":"value required"
  })
})
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

const DeliveryToggleStatusSchema=Joi.object({
  id:Joi.number().integer().required().messages({
    "number.base":"ID must be a number",
    "number.integer":"ID must be an integer",
    "any.required":"ID is required"
  }),
  value:Joi.string().valid("status").required().messages({
    "any.required":"value required"
  })
})

// for faq
const upsertFaqSchema = Joi.object({
  id: Joi.number().optional().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  question: Joi.string().trim().required().messages({
    "string.base": "Question must be a string.",
    "any.required": "Question is required.",
  }),
  answer: Joi.string().trim().required().messages({
    "string.base": "Answer must be a string.",
    "any.required": "Answer is required.",
  }),
  status: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
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
});

const FaqStatusSchema = Joi.object({
  id: Joi.number().messages({
    "string.pattern.base": "ID must be a number.",
    "any.only": "ID cannot be empty."
  }),
  value: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
  field: Joi.string().valid("status").required().messages({
    "number.base": "field must be status.",
    "any.required": "field is required.",
  }),

});

// for Rider
const upsertRiderSchema = Joi.object({
  id: Joi.number().integer().optional().allow(null, '').messages({
    "number.base": "ID must be a number.",
    "any.only": "ID cannot be empty.",
  }),
  store_id: Joi.number().integer().required().messages({
    "number.base": "Store ID must be a number.",
    "any.required": "Store ID is required.",
  }),
  img: Joi.string().uri().optional().allow(null, '').messages({
    "string.base": "Image must be a valid URI.",
  }),
  name: Joi.string().trim().required().messages({
    "string.base": "Name must be a string.",
    "any.required": "Name is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  mobile: Joi.string().pattern(/^\d{10,10}$/).required().messages({
    "string.pattern.base": "Mobile must be a valid number with 10  digits.",
    "any.required": "Mobile is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
  rdate: Joi.date().iso().required().messages({
    "date.base": "Registration date must be a valid ISO date.",
    "any.required": "Registration date is required.",
  }),
  status: Joi.number().integer().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
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

const RiderStatusSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "any.required": "ID is required.",
  }),
  value: Joi.number().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.required": "Status is required.",
  }),
});
const RiderToggleStatusSchema=Joi.object({
  id:Joi.number().integer().required().messages({
    "number.base":"ID must be a number",
    "number.integer":"ID must be an integer",
    "any.required":"ID is required"
  }),
  value:Joi.string().valid("status").required().messages({
    "any.required":"value required"
  })
})
// time
const upsertTimeSchema = Joi.object({
  id: Joi.number().integer().optional().allow(null).messages({
    "number.base": "ID must be a number.",
    "any.allowOnly": "ID cannot be empty."
  }),
  store_id: Joi.number().integer().required().messages({
    "number.base": "Store ID must be a number.",
    "any.required": "Store ID is required."
  }),
  mintime: Joi.string().required().messages({
    "string.base": "Mintime must be a string.",
    "any.required": "Mintime is required."
  }),
  maxtime: Joi.string().trim().required().messages({
    "string.base": "Maxtime must be a string.",
    "any.required": "Maxtime is required."
  }),
  status: Joi.number().integer().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.only": "Status must be either 0 or 1.",
    "any.required": "Status is required."
  })
})

const getTimeIdBySchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const DeleteTimeSchema = Joi.object({
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

const TimeSearchSchema = Joi.object({
  id: Joi.string().pattern(/^\d+$/).allow(null).optional().messages({
    "string.pattern.base": "ID must be a numeric string.",
    "any.allowOnly": "ID cannot be empty."
  }),

  mintime: Joi.string().trim().required().messages({
    "string.base": "Mintime must be a string.",
    "any.required": "Mintime is required."
  }),

  maxtime: Joi.string().trim().required().messages({
    "string.base": "Maxtime must be a string.",
    "any.required": "Maxtime is required."
  }),

  status: Joi.number().integer().valid(0, 1).required().messages({
    "number.base": "Status must be a number (0 or 1).",
    "any.only": "Status must be either 0 or 1.",
    "any.required": "Status is required."
  }),
});

const timeToggleStatusSchema=Joi.object({
  id:Joi.number().integer().required().messages({
    "number.base":"ID must be a number",
    "number.integer":"ID must be an integer",
    "any.required":"ID is required"
  }),
  value:Joi.string().valid("status").required().messages({
    "any.required":"value required"
  })
})

// for coupon
const getCouponByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    "number.base": "ID must be a number.",
    "number.integer": "ID must be an integer.",
    "any.required": "ID is required.",
  }),
});

const CouponDeleteSchema = Joi.object({
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

// const ProductSearchSchema = Joi.object({
//   id: Joi.number().integer().optional().messages({
//     "number.base": "ID must be a number.",
//     "number.integer": "ID must be an integer.",
//   }),
//   title: Joi.string().trim().optional().messages({
//     "string.base": "Title must be a string.",
//   }),
// });

const upsertCouponSchema = Joi.object({
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

  coupon_img: Joi.string().trim().optional().messages({
    "string.base": "Image URL must be a string.",
  }),

  coupon_code: Joi.string().trim().required().messages({
    "string.base": "Coupon code must be a string.",
    "any.required": "Coupon code is required.",
  }),

  subtitle: Joi.string().trim().required().messages({
    "string.base": "Subtitle must be a string.",
    "any.required": "Subtitle is required.",
  }),

  expire_date: Joi.string().trim().required().messages({
    "string.base": "Expire date must be a string.",
    "any.required": "Expire date is required.",
  }),

  min_amt: Joi.number().positive().required().messages({
    "number.base": "Minimum amount must be a number.",
    "number.positive": "Minimum amount must be greater than zero.",
    "any.required": "Minimum amount is required.",
  }),

  coupon_val: Joi.number().positive().required().messages({
    "number.base": "Coupon value must be a number.",
    "number.positive": "Coupon value must be greater than zero.",
    "any.required": "Coupon value is required.",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string.",
    "any.required": "Description is required.",
  }),
});

const couponToggleStatus=Joi.object({
  id:Joi.number().integer().required().messages({
    "number.base":"ID must be a number",
    "number.integer":"ID must be an integer",
    "any.required":"ID is required"
  }),
  value:Joi.string().valid("status").required().messages({
    "any.required":"value required"
  })
})

module.exports = {
  registerAdminSchema, loginAdminSchema, updateAdminSchema, deleteAdminSchema, getAdminbyIdSchema, searchAdminSchema,
  getCategoryByIdSchema, categoryDeleteSchema, categorySearchSchema, upsertCategorySchema,categoryToggleStatus,
  getProductByIdSchema, ProductDeleteSchema, ProductSearchSchema, upsertProductSchema,productToggleStatusSchema,
  getProductAttributeByIdSchema, ProductAttributeDeleteSchema, ProductAttributeSearchSchema, upsertProductAttributeSchema,
  ProductImagesByIdSchema, ProductImagesDeleteSchema, ProductImagesSearchSchema, ProductImagesUpsertSchema,
  getDeliveryByIdSchema, DeliveryDeleteSchema, DeliverySearchSchema,DeliveryToggleStatusSchema,
  upsertFaqSchema, getFaqIdBySchema, FaqDeleteSchema, FaqSearchSchema, FaqStatusSchema,
  RiderSearchSchema, RiderDeleteSchema, getRiderIdBySchema, upsertRiderSchema, RiderStatusSchema,RiderToggleStatusSchema,
  upsertTimeSchema, getTimeIdBySchema, DeleteTimeSchema, TimeSearchSchema,timeToggleStatusSchema,
  upsertCouponSchema, CouponDeleteSchema, getCouponByIdSchema,couponToggleStatus,
}