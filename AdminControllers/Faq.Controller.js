const Faq=require("../Models/Faq");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { getFaqIdBySchema, FaqDeleteSchema, FaqSearchSchema, upsertFaqSchema, FaqStatusSchema } = require("../utils/validation");

const upsertFaq = asynHandler(async (req, res) => {
    const { error, value } = upsertFaqSchema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.error(error)
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: error.details.map((detail) => detail.message).join(", "),
      });
    }
  
    const { id, question, answer, status } = value;

      if (id) {
        const faq = await Faq.findByPk(id);
        if (!faq) {
          logger.error('faq not found')
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "FAQ not found",
        });
        }
  
        await faq.update({
            question,
            answer,
            status,
          });
  
        res.status(200).json({ message: "FAQ updated successfully", faq });
      } else {
        const faq = await Faq.create({
          question,
          answer,
          status,
        });
        logger.info('FAQ created successfully')
        res.status(201).json({ message: "FAQ created successfully", faq });
      }
});

const getAllFaqs=asynHandler(async(req,res,next)=>{
    const Faqs=await Faq.findAll();
    logger.info("sucessfully get all Faq's");
    res.status(200).json(Faqs);
});

const getFaqCount=asynHandler(async(req,res)=>{
    const FaqCount=await Faq.count();
    const Faqs=await Faq.findAll();
    logger.info("Faqs",FaqCount)
    res.status(200).json({Faqs,Faq:FaqCount})
});

const getFaqById=asynHandler(async(req,res)=>{
    const {error}=getFaqIdBySchema.validate(req.params)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
    }

    const {id}=req.params;
    console.log(id)
    const FaqDetails=await Faq.findOne({where:{id:id}});
    if(!FaqDetails){
        logger.error('Faq not found')
        return res.status(404).json({error:"Faq not found"})
    }
    logger.info("Faq found");
    res.status(200).json(FaqDetails)
});

const deleteFaq = asynHandler(async (req, res) => {
    const dataToValidate = { ...req.params, ...req.body };
    const {error}=FaqDeleteSchema.validate(dataToValidate)
    if (error) {
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
      }
    const { id } = req.params;
    const { forceDelete } = req.body;

        const FaqDel = await Faq.findOne({ where: { id }, paranoid: false });

        if (!FaqDel) {
            logger.error("Faq not found");
            return res.status(404).json({ error: "Faq not found" });
        }

        if (FaqDel.deletedAt && forceDelete !== "true") {
            logger.error("Faq is already soft-deleted");
            return res.status(400).json({ error: "Faq is already soft-deleted. Use forceDelete=true to permanently delete it." });
        }

        if (forceDelete === "true") {
            await FaqDel.destroy({ force: true });
            logger.info("Faq permanently deleted");
            return res.status(200).json({ message: "Faq permanently deleted successfully" });
        }

        await FaqDel.destroy();
        logger.info("Faq soft-deleted");
        return res.status(200).json({ message: "Faq soft deleted successfully" });
});

const searchFaq=asynHandler(async(req,res)=>{
    const {error}=FaqSearchSchema.validate(req.body);
    if(error){
        logger.error(error.details[0].message)
        return res.status(400).json({ error: error.details[0].message });
    }
    const {id,title}=req.body;
        const whereClause={};
        if(id){
            whereClause.id=id;
        }

        if(title && title.trim()!=""){
            whereClause.title={[Sequelize.Op.like]: `%${title.trim()}%`};
        }

        const Faq=await Faq.findAll({where:whereClause});

        if(Faq.length === 0){
            logger.error("No matching admins found")
            return res.status(404).json({ error: "No matching admins found" });
        }
        logger.info("Faqs found ")
        res.status(200).json(Faq)
});

const toggleFaqStatus = asynHandler(async (req, res) => {
    console.log("Request received:", req.body);
    const { error } = FaqStatusSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: error.details.map((detail) => detail.message).join(", "),
      });
    }
  
    const { id, value } = req.body;
      const faq = await Faq .findByPk(id);
  
      if (!faq) {
        console.log("faq not found");
        return res.status(404).json({ message: "faq not found." });
      }
  
      faq.status = value;
      await faq.save();
  
      console.log("faq updated successfully:", faq);
      res.status(200).json({
        message: "faq status updated successfully.",
        updatedStatus: faq.status,
      });
});

module.exports={
    upsertFaq,
    getAllFaqs,
    getFaqCount,
    getFaqById,
    deleteFaq,
    searchFaq,
    toggleFaqStatus
}