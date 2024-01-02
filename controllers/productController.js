import slugify from "slugify";
import productModel from "../models/productModel.js";
import CategoryModel from "../models/CategoryModel.js";
import fs from 'fs'
import braintree from "braintree";
import orderModel from "../models/orderModel.js";

//payment gateway
var gateway = new braintree.BraintreeGateway({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'xgw6qgfxjgzcj4n5',
    publicKey:    '6kwpwyf6mydh923y',
    privateKey:   '8c230a3082a5ef95973ce98d3597370d'
  });
  


export const createProductController=async (req,res)=>{
try {

    const {name,slug,description,price,category,quantity,shipping}=req.fields
    const {photo}=req.files
    //validation
    switch(true){
        case !name:
            return res.status(500).send({error:'Name is required'})
        
        case !description:
            return res.status(500).send({error:'description is required'})
            
        case !price:
            return res.status(500).send({error:'price is required'})

        case !category:
            return res.status(500).send({error:'category is required'})
        
        case !quantity:
            return res.status(500).send({error:'Quantity is required'})

        case !photo:
            return res.status(500).send({error:'photo is required and should be less than 1 mb'})
    }





    const products=new productModel({...req.fields,slug:slugify(name)})
    if(photo){
        products.photo.data=fs.readFileSync(photo.path)
        products.photo.contentType=photo.type
    }
    await products.save()
    res.status(201).send({
        success:true,
        message:'Product Created Successfully',
        products,
    })
    
} catch (error) {
    console.log(error)
    res.status(500).send({
        success:false,
        error,
        message:'Error in creating Product'
    })
}


};

//get all product

export const getProductController=async (req,res)=>{
    try {
        const products=await productModel.find({}).populate('category').select('-photo').limit(12).sort({createdAt:-1})
        res.status(200).send({
            success:true,
            countTotal:products.length,
            message:'all products',
            products,
            
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in getting products',
            error:error.message
        })

        
    }

}

//get single product 

export const getSingleProductController=async (req,res)=>{

    try {
        const product=await productModel.findOne({slug:req.params.slug}).select('-photo').populate('category')
        res.status(200).send({
            success:true,
            message:'single product fetched',
            product,
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error while getting single product',
            error
        })
        
    }
}

//get photo

export const productPhotoController=async (req,res)=>{
    try {
        const product =await productModel.findById(req.params.pid).select('photo')
        if(product.photo.data){
            res.set('Content-type',product.photo.contentType)
            return res.status(200).send(product.photo.data)
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'error while getting photo',
            error
        })
    }
}

//delete controller
export const deleteProductController=async (req,res)=>{
    try {
        await productModel.findByIdAndDelete(req.params.pid).select('-photo')
        res.status(200).send({
            success:true,
            message:'Product Deleted Successfully'
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error while deleting product',
            error
        })
    }
}

//update product

export const updateProductController=async (req,res)=>{
    try {

        const {name,slug,description,price,category,quantity,shipping}=req.fields
        const {photo}=req.files
        //validation
        switch(true){
            case !name:
                return res.status(500).send({error:'Name is required'})
            
            case !description:
                return res.status(500).send({error:'description is required'})
                
            case !price:
                return res.status(500).send({error:'price is required'})
    
            case !category:
                return res.status(500).send({error:'category is required'})
            
            case !quantity:
                return res.status(500).send({error:'Quantity is required'})
    
            case photo && photo.size>10000000:
                return res.status(500).send({error:'photo is required and should be less than 1 mb'})
        }
    
    
    
    
    
        const products=await productModel.findByIdAndUpdate(req.params.pid,
            {...req.fields,slug:slugify(name)},
            {new:true}
            )
        if(photo){
            products.photo.data=fs.readFileSync(photo.path)
            products.photo.contentType=photo.type
        }
        await products.save()
        res.status(201).send({
            success:true,
            message:'Product Updated Successfully',
            products,
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in Updating Product'
        })
    }
    
    
    };

//filters
export const productFiltersController=async(req,res)=>{
    try {
        const {checked,radio}=req.body
        let args={}
        if(checked.length>0) args.category=checked
        if(radio.length) args.price={$gte:radio[0],$lte:radio[1]}
        const products=await productModel.find(args)
        res.status(200).send({
            success:true,
            products
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success:false,
            message:'error while filtering products'
        })
    }


}


//product count
export const productCountController=async(req,res)=>{
    try {
        const total=await productModel.find({}).estimatedDocumentCount()
        res.status(200).send({
            success:true,
            total,
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).send({
            message:'Error in product count',
            error,
            success:false
        })
        
    }
}

//product list based on page

export const productListController=async (req,res)=>{
    try {
        const perPage=6
        const page=req.params.page?req.params.page:1
        const products=await productModel
        .find({})
        .select('-photo')
        .skip((page-1)*perPage)
        .limit(perPage)
        .sort({createdAt :-1});

        res.status(200).send({
            success:true,
            products,
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success:false,
            message:'error in per page ctrl',
            error
        })
        
    }
}

//search product
export const searchProductController=async(req,res)=>{
    try {
        const {keyword}=req.params
        const results=await productModel.find({
            $or:[
                {name:{$regex : keyword,$options:'i'}},
                {description:{$regex : keyword,$options:'i'}}
            ]
        }).select('-photo');

        res.json(results)

        
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success:false,
            message:'Error in search product api',
            error
        })
    }
}

//similar products

export const relatedProductController=async (req,res)=>{
    try {
        const {pid,cid}=req.params
        const products=await productModel.find({
            category:cid,
            _id:{$ne:pid}
        }).select('-photo').limit(3).populate('category')
        res.status(200).send({
            success:true,
            products,
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success:false,
            message:'error while getting related product',
            error
        })
        
    }


}

//get product by Category
export const productCategoryController=async (req,res)=>{
    try {
        const category =await CategoryModel.findOne({slug:req.params.slug})
        const product=await productModel.find({category}).populate('category')
        res.status(200).send({
            success:true,
            category,
            product
        })
        

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success:false,
            error,
            message:'Error while getting products'
        })
        
    }

}

//payment gateway api
//token
export const braintreeTokenController=async (req,res)=>{
    try {
        gateway.clientToken.generate({},function(err,response){
            if(err){
                res.status(500).send(err)
            }
            else{
                res.send(response);
            }
        })
        
    } catch (error) {
        console.log(error)
    }
}

//payment
export const brainTreePaymentController=async (req,res)=>{
    try {
        const {cart,nonce}=req.body
        let total=0
        cart.map((i)=>{
            total+=i.price
        
        });
        let newTransaction=gateway.transaction.sale({
            amount:total,
            paymentMethodNonce:nonce,
            options:{
                submitForSettlement:true
            }
        },
        function(error,result){
            if(result){
                const order=new orderModel({
                    products:cart,
                    payment:result,
                    buyer:req.user._id
                }).save()
                res.json({ok:true})
            }
            else{
                res.status(500).send(error)
            }
        }
        )
        
    } catch (error) {
        console.log(error)
    }
}
