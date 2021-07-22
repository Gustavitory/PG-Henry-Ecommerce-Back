const { Product, Review, User } = require('../../db.js');
const { v4: uuidv4 } = require('uuid');
const { Op } = require("sequelize");

const newReview = async(req, res, next) => {
    const { comment, rating, idProd } = req.body
    const { idUser } = req.params
    console.log("req.body", req.body)
    console.log("req.params", req.params)
    if (!comment) return next({message: "Se precisa comentario"})
    if(!rating ) return next({message: "Se precisa rating"})
    try {
        const id = uuidv4()
        console.log('entro al try')
        const review = await Review.create({
            id,
            rating: rating.toString(),
            comment
        })
        console.log(review)
        const Prod = await Product.findByPk(idProd)
        await Prod.addReview(review)
        console.log('paso el add review de prod')
        const user = await User.findByPk(idUser)
        console.log('User: ', user)
        await user.addReview(review)
        console.log('paso el add review de user')
        return res.status(200).json({message: 'Review created'})
    } catch (error){
        return res.status(500).json(error)
    }
}

const updateReview = async (req, res, next)  => {
	const {idRev} = req.body
	try{
		const rev = Review.findByPk(idRev)
		if (req.body.comment) rev.comment = comment;
		if (req.body.rating) rev.rating = rating;
		rev.save()
		return res.status(200).json({message: 'Review updated'})
	}catch(error){
		return res.status(500).json({message: 'Error DB'})
	}

}

const deleteReview = async (req, res, next) => {
	try {
        	await Review.destroy({
            	where: {
                	id: req.body.idRev
            	}
        })
        return res.status(200).send('the review was succesfully deleted')
    } catch (error) {
        next(error);
    }
}

module.exports = {
    newReview, 
    updateReview, 
    deleteReview
}
