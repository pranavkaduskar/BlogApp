const express = require('express');

let router = express.Router();

const { checkLoggedIn } = require('../../middlewares/auth');
const { grantAccess } = require('../../middlewares/roles');
const {sortArgsHelper} = require('../../config/helper')
//model
const {Article} = require('../../models/article_model');

//add single article


//admin get, patch, delete single article (draft or public)


//get articles no auth

//fetch articles load more

//fetch  articles, with pagination

router.route('/admin/add_articles')
.post(checkLoggedIn,grantAccess('createAny','article'), async(req,res)=>{
    try {
        // run some aother code to validate
        const article = new Article({
            ...req.body,
            score:parseInt(req.body.score)

        });
        const result = await article.save();
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({message:'Error adding article',error:error})
        
    }
});

router.route("/admin/:id")
.get(checkLoggedIn,grantAccess('readAny','article'),async(req,res)=>{
    try {
        const _id = req.params.id;
        const article = await Article.findById(_id);
        if(!article || article.length === 0){
            return res.status(400).json({message:'Article not found'})
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({message:'Error fetching article', error});
        
    }
})
.patch(checkLoggedIn,grantAccess('updateAny','article'),async(req,res)=>{
    try { 
        const _id = req.params.id;
        const article = await Article.findOneAndUpdate(
            {_id},
            {
                "$set": req.body
            },
            {
                new:true
            }
        );
        if(!article ) return res.status(400).json({message:'Article not found'})
            res.status(200).json(article);

    } catch (error) {
        res.status(400).json({message:'Error Updating article', error});

    }
})
.delete(checkLoggedIn,grantAccess('deleteAny','article'),async(req,res)=>{
    try {

        const _id = req.params.id;
        const article = await Article.findByIdAndRemove(_id);

        if(!article ) return res.status(400).json({message:'Article not found'})
            res.status(200).json({_id:article._id});

    } catch (error) {
        res.status(400).json({message:'Error Dellting article', error});


    }
})


router.route("/admin/paginate")
.post(checkLoggedIn,grantAccess('readAny', 'articles'),async(req,res)=>{
    try {
        
        //fetch articles from data

        //if you wont to filter acording to tile. any key or value
        // let aggregateQuery = Article.aggregate([
        //     // { $match: {status:"public"}}
        //     { $match: { title:{ $regex:/Lorem/}}}
        // ])

        const limit = req.body.limit ? req.body.limit : 5;
        const aggQuery = Article.aggregate();
        const options = {
            page: req.body.page,
            limit,
            sort:{_id: 'desc'}
            // sort:{_id: 'asc'} //for asending oder

        }
        const articles = await Article.aggregatePaginate(aggQuery, options)
        res.status(200).json(articles)
        
    } catch (error) {
        res.status(400).json({message:"Error found can not open pagination" })
        
    }
})
/// No Auth Required ///
router.route("/get_byid/:id")
.get(async(req,res)=>{
    try {
        const _id = req.params.id;
        const article = await Article.find({_id:_id,status:'public'} );
        if(!article || article.length === 0){
            return res.status(400).json({message:'Article not found'})
        }
        res.status(200).json(article)

        
    } catch (error) {
        return res.status(400).json({message:'Error feching Article',error})

    }
})

router.route("/loadmore")
.post(async(req,res)=>{
    try {
    //    {sortBy: "_id",order:"asc",limit:10,skip:0}
    let sortArgs = sortArgsHelper(req.body)

    const articles = await Article
    .find({status:'public'})
    .sort([[sortArgs.sortBy, sortArgs.order]])
    .skip(sortArgs.skip)
    .limit(sortArgs.limit)


    res.status(200).json(articles)

    } catch (error) {
        return res.status(400).json({message:'Error feching Article',error})

    }
})




module.exports = router;