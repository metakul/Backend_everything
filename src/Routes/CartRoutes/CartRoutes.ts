import express from "express";
import * as CartController from "../../Controllers/Post/CartController.js";
import checkJwt from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";
import { checkUserCategoryExists } from "../../Middleware/IfUserCategoryExist.js";

const router = express.Router();

router.post("/cart/add", checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User, UserCategory.SUPER_ADMIN, UserCategory.ROADIES_SUPER_ADMIN]),
    checkUserCategoryExists, CartController.addToCart);

router.post("/cart/remove", checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User, UserCategory.SUPER_ADMIN, UserCategory.ROADIES_SUPER_ADMIN]),
    checkUserCategoryExists, CartController.removeFromCart);
    
router.get("/cart", checkJwt([UserCategory.Verifier, UserCategory.Holder, UserCategory.User, UserCategory.SUPER_ADMIN, UserCategory.ROADIES_SUPER_ADMIN]),
    checkUserCategoryExists, CartController.fetchCart);

export default router;
