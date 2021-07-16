const { User, Product, Order, Order_Line } = require('../../db.js');

const exclude = ['createdAt', 'updatedAt']

const getAllOrders = async (req, res, next) => {
    // if (!req.query.status) return res.status(400).send("Status is required ")
    const status = req.query.status
     try {
         const orderByStatus = await Order.findAll(
             status ?
             {
                where: {
                    status: req.query.status                
                }          
            } :
            {}
         )
         if (!orderByStatus.length) {
             return res.status(400).json({ message: 'There are not orders with that status.' })
         }
         return res.status(200).json(orderByStatus)
     } catch (error) {
         next(error);
     }
 };

 const userOrders = async (req, res, next) => {
    if (!req.params.idUser) return res.status(400).send("Correct idUser is required ")
    try {
        const userOrders = await Order.findAll({
            where: {
                UserId: req.params.idUser,
                status: 'cart'              
            }          
        })
        if (!userOrders.length) {
            return res.status(400).json({ message: 'The user has not any order' })
        }
        
        return res.status(200).json(userOrders)
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    const {id} = req.params
    if (!id) return res.status(400).send("Order ID is required")
    try {
        const order = await Order.findOne({
            where: {
                id
            },
            include: {
                model: Product,
                through: {
                    attributes: []
                },
                attributes: {
                    exclude
                }
            }
        })
        return res.send(order)
    }catch(err) {
        return res.status(400).send(err)
    }
};

const updateOrder = async (req, res, next) => {
    const {id} = req.params
    const {products} = req.body    
    if(!id) return res.status(400).send('El id de la orden es requerido')
    if(!products) return res.status(400).send('Los productos a actualizar son requeridos')
    try {
        const orderToDelete = await Order.findByPk(id)
        if(!orderToDelete) return res.status(400).send('El id de la orden enviada es inválido')
        const UserId = orderToDelete.UserId
        const user = await User.findByPk(UserId);
        if(!user) return res.status(400).send('El usuario es inválido')
        const verifiedProductsPromises = products.map(async productToAdd => {            
            try {
                const product = await Product.findByPk(productToAdd.id);
                if (!product) {
                    return 'El id de alguno de los productos enviados es inválido'
                };
                if (product.stock < productToAdd.quantity) {
                    return 'No hay stock suficiente de alguno de los productos'
                }
            } catch(err){
                console.error(err)
                return err    
            }
        })
        const error = await Promise.all(verifiedProductsPromises).then(result => result).catch(err => err)        
        const concatError = [...new Set(error.filter(element => element))].join('. ')
        if(concatError) return res.status(400).send(concatError)
        await orderToDelete.destroy()
        const order = await Order.create()        
        await user.addOrder(order);
        await products.forEach(async productToAdd => {            
            try {
                const product = await Product.findByPk(productToAdd.id);
                const quantity = Number(productToAdd.quantity);
                const price = product.price
                await product.addOrder(order, { through: { orderId: order.id, quantity, price } })
            } catch(err){
                console.error(err)    
            }
        })
        return res.send('La orden fue actualizada con éxito')
    }catch(err) {
        return res.status(400).send(err)
    }
};
 
 module.exports = {
     getAllOrders,
     userOrders,
     getOrderById,
     updateOrder    
 }