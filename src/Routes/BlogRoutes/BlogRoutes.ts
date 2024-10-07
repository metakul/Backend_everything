import { Router } from "express";
import cors from "cors";
import checkJwt from "../../Middleware/checkJwt.js";
import * as BlogController from "../../Controllers/Post/BlogsController.js";

const router: Router = Router();
router.use(cors());
//create post
router.post("/",checkJwt, BlogController.CreateBlog);




export default router;