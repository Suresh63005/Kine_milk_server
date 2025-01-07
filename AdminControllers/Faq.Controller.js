const Faq=require("../Models/Faq");
const {Op}=require("sequelize")
const asynHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const { getFaqIdBySchema, FaqDeleteSchema, FaqSearchSchema, upsertFaqSchema } = require("../utils/validation");

const upsertFaq = async (req, res) => {
    console.log(req);
    const { id, question, answer, status } = req.body;
    console.log(req.body);
    try {
      if (id) {
        // Update FAQ
        const faq = await Faq.findByPk(id);
        if (!faq) {
          return res.status(404).json({ error: "FAQ not found" });
        }
  
        faq.question = question;
        faq.answer = answer;
        faq.status = status;
  
        await faq.save();
        res.status(200).json({ message: "FAQ updated successfully", faq });
      } else {
        // Create new FAQ
        const faq = await Faq.create({
          question,
          answer,
          status,
        });
        res.status(201).json({ message: "FAQ created successfully", faq });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  };

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

module.exports={
    upsertFaq,
    getAllFaqs,
    getFaqCount,
    getFaqById,
    deleteFaq,
    searchFaq
}