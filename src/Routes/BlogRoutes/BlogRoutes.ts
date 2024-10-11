import { Router } from "express";
import cors from "cors";
import checkJwt from "../../Middleware/checkJwt.js";
import * as BlogController from "../../Controllers/Post/BlogsController.js";

const router: Router = Router();
router.use(cors());
//create blog
router.post("/",checkJwt, BlogController.CreateBlog);



// Route for fetching pending blogs
router.get('/blogType', BlogController.getAllBlogsByStatus);

//get one blog
router.get("/:blogId", BlogController.getBlog);

router.get("/cryptoInfo/:cryptoId", BlogController.getCryptoInfo);

//update blog
router.patch("/:blogId",checkJwt, BlogController.updateBlog);

router.patch('/updateStatus/:blogId',checkJwt, BlogController.updateBlogStatus);


//delete blog
router.delete("/:blogId",checkJwt, BlogController.deleteBlog);

export default router;