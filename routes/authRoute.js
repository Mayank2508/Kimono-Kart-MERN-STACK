import express from 'express'
import { registerController,loginController,testController,forgotPasswordController, updateProfileController, getOrdersController, } from '../controllers/authController.js'
import { isAdmin, requireSignIn } from '../middleware/authMiddleware.js'
const router=express.Router()
router.post('/register',registerController)
router.post('/login',loginController)
//forgot password
router.post('/forgot-password',forgotPasswordController)
router.get('/test',requireSignIn,isAdmin, testController)
//protected route
router.get('/user-auth',requireSignIn,(req,res)=>{
    res.status(200).send({ok:true})
})
//ADMIN ROUTEa
router.get('/admin-auth',requireSignIn,isAdmin,(req,res)=>{
    res.status(200).send({ok:true})
})

//update profile
router.put('/profile',requireSignIn,updateProfileController)
//orders
router.get('/orders',requireSignIn,getOrdersController)

//all orders


export default router;