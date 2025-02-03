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

const bannerUpsertSchema = Joi.object({
  id: Joi.number().integer().positive().optional(),
  status: Joi.number().integer().valid(0, 1).required().messages({
    'number.base': 'Status must be a number.',
    'any.required': 'Status is required.',
    'any.only': 'Status must be either 0 (inactive) or 1 (active).'
  })
});

const bannerListSchema = Joi.object({
  page: Joi.number().integer().positive().default(1).messages({
    'number.base': 'Page must be a number.',
    'number.positive': 'Page must be greater than 0.'
  }),
  limit: Joi.number().integer().positive().default(10).messages({
    'number.base': 'Limit must be a number.',
    'number.positive': 'Limit must be greater than 0.'
  }),
  status: Joi.number().integer().valid(0, 1).optional().messages({
    'number.base': 'Status must be a number.',
    'any.only': 'Status must be either 0 (inactive) or 1 (active).'
  })
});

const storeValidationSchema = Joi.object({
  id: Joi.number().integer().optional(),
  store_name: Joi.string().required(),
  store_logo: Joi.string().required(),
  store_cover_image: Joi.string().required(),
  status: Joi.number().integer().required(),
  rating: Joi.number().precision(2).optional(),
  c_license_code: Joi.string().required(),
  mobile: Joi.number().integer().required(),
  slogan: Joi.string().required(),
  slogan_subtitle: Joi.string().allow(null, ""),
  s_open_time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  s_close_time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  s_pickup_status: Joi.number().integer().allow(null),
  tags: Joi.array()
    .items(Joi.string())
    .required()
    .custom((value, helpers) => {
      if (new Set(value).size !== value.length) {
        return helpers.message("Tags must be unique.");
      }
      return value;
    }),
  short_desc: Joi.string().required(),
  cancel_policy: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  s_type: Joi.number().integer().required(),
  full_address: Joi.string().required(),
  pincode: Joi.number().integer().required(),
  select_zone: Joi.string().allow(null, ""),
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  service_charge_type: Joi.string()
    .valid("Fixed Charges", "Dynamic Charges")
    .required(),
  s_charge: Joi.number().precision(2).required(),
  min_order_price: Joi.number().precision(2).required(),
  commission_rate: Joi.string().allow(null, ""),
  bank_name: Joi.string().required(),
  recipient_name: Joi.string().required(),
  paypal_id: Joi.string().allow(null, ""),
  bank_code: Joi.string().allow(null, ""),
  account_number: Joi.string().allow(null, ""),
  upi_id: Joi.string().allow(null, ""),
});

const upsertStoreSchema = Joi.object({
  id: Joi.number().integer().optional(), // Required for update, optional for add
  store_name: Joi.string().min(3).max(255).required(),
  store_logo: Joi.string().uri().optional(),
  store_cover_image: Joi.string().uri().optional(),
  status: Joi.number().integer().valid(0, 1).required(),
  rating: Joi.number().min(0).max(5).optional(),
  c_license_code: Joi.string().required(),
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    "string.pattern.base": "Mobile number must be a valid 10-digit Indian number.",
  }),
  slogan: Joi.string().required(),
  slogan_subtitle: Joi.string().optional().allow(""),
  s_open_time: Joi.string()
  .trim()  // This will remove leading and trailing whitespace
  .pattern(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/)
  .required()
  .messages({
    "string.pattern.base": "Open time must be in HH:mm format.",
  }),

  s_close_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    "string.pattern.base": "Close time must be in HH:mm format.",
  }),
  s_pickup_status: Joi.number().integer().valid(0, 1).optional(),
  tags: Joi.array().items(Joi.string().min(1)).unique().required(),
  short_desc: Joi.string().required(),
  cancel_policy: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  s_type: Joi.number().integer().required(),
  full_address: Joi.string().required(),
  pincode: Joi.number().integer().min(100000).max(999999).required(),
  select_zone: Joi.string().optional().allow(""),
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  service_charge_type: Joi.string().valid("Fixed Charges", "Dynamic Charges").required(),
  s_charge: Joi.number().positive().required(),
  min_order_price: Joi.number().positive().required(),
  commission_rate: Joi.string().optional().allow(""),
  bank_name: Joi.string().required(),
  recipient_name: Joi.string().required(),
  paypal_id: Joi.string().email().optional().allow(""),
  bank_code: Joi.string().optional().allow(""),
  acc_number: Joi.string().optional().allow(""),
  upi_id: Joi.string().optional().allow(""),
  bank_ifsc: Joi.string().optional().allow(""),
});


module.exports={registerAdminSchema,loginAdminSchema,updateAdminSchema, deleteAdminSchema,getAdminbyIdSchema,searchAdminSchema,
    getCategoryByIdSchema,categoryDeleteSchema,categorySearchSchema,upsertCategorySchema,
    getProductByIdSchema,ProductDeleteSchema,ProductSearchSchema,upsertProductSchema,
    getProductAttributeByIdSchema,ProductAttributeDeleteSchema,ProductAttributeSearchSchema,upsertProductAttributeSchema,
    ProductImagesByIdSchema,ProductImagesDeleteSchema,ProductImagesSearchSchema,ProductImagesUpsertSchema,
    getDeliveryByIdSchema,DeliveryDeleteSchema,DeliverySearchSchema,
    upsertFaqSchema,getFaqIdBySchema,FaqDeleteSchema,FaqSearchSchema,
    RiderSearchSchema,RiderDeleteSchema,getRiderIdBySchema,upsertRiderSchema,
    upsertTimeSchema,getTimeIdBySchema,DeleteTimeSchema,TimeSearchSchema,
    upsertCouponSchema,CouponDeleteSchema,getCouponByIdSchema, bannerUpsertSchema,bannerListSchema,
    storeValidationSchema,upsertStoreSchema
}