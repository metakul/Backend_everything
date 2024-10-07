import { Request, Response, NextFunction } from "express";
import { IUpadateBlog, Iblog } from "../../DataTypes/interfaces/IBlog.js";
import { fetchCryptoData  } from "../../Utils/scripts/AxiosCall.js";
import { prisma } from "../../db/client.js";
import { BlogsStatusInfo } from "../../DataTypes/enums/IUserEnums.js";
import { BlogIdValidationService, BlogValidationService, CryptoIdValidationService } from "../../Validation/BlogValidation.js";

/**
 * add new Blog
 * @param blogModelValidation
 */
const addBlog = async (blogModelValidation: Iblog) => {
  try {
    const blog = await prisma.blogs.create({
        data: {
          title: blogModelValidation.title,
          description: blogModelValidation.description || '',
          image: blogModelValidation.image,
          author: blogModelValidation.author,
          categories: blogModelValidation.categories,
          cryptoSymbol: blogModelValidation.cryptoSymbol,
          status:BlogsStatusInfo.PENDING
        },
      });
      return blog;

  } catch (error) {
    console.log(error);
  }
};

/**
 * Create a new blog
 * @param req
 * @param res
 * @param next
 */
export const CreateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogModelValidation: Iblog | undefined = await BlogValidationService.validateCreateBlog(
        req.body
      );

    if (!blogModelValidation) {
      
        res.status(400).json({
          message: "Invalid details provided.",
        })
    } else {
      const newBlog = await addBlog(blogModelValidation);
      if (newBlog) {
        res.status(201).json({
          newBlog,
        });
      } else {
        
          res.status(400).json({
            message: "Error Adding Blog",
          })
      }
    }
  } catch (error) {
    
    next(error);
  }
};

/**
 * Get all blogs based on status
 * @param req
 * @param res
 * @param next
 */
export const getAllBlogsByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;
    
    if (!status || (status !== BlogsStatusInfo.APPROVED && status !==BlogsStatusInfo.PENDING)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }
    
    const pageSize = parseInt(req.query.pagesize as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    const skip = (page - 1) * pageSize;

    const query = { status: status };

    const blogs = await prisma.blogs.findMany({
        where: {
          status: status || BlogsStatusInfo.APPROVED,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    if (blogs.length > 0) {
      res.status(200).json(blogs);
    } else {
      return res.status(404).json({ message: 'No blogs found with the specified status' });
    }
  } catch (error) {
    next(error);
  }
};


/**
 * get one blog
 * @param req
 * @param res
 * @param next
 */
export const getBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogIdValidation = await BlogIdValidationService.validateBlogId(
      req.params.blogId
    );
    
    if (!blogIdValidation) {
        res.status(400).json({
          message: "Operation failed, invalid details provided.",
        })
    } else {
        let getBlogs;
        if (req.params.blogId) {
          // Fetch blogs by blogId
          getBlogs = await prisma.blogs.findMany({
            where: {
              id:  req.params.blogId, // Assuming blogId is a numeric ID, adjust as per your schema
            },
          });
        } else {
          // Fetch all blogs
          getBlogs = await prisma.blogs.findMany();
        }

      if (getBlogs.length > 0) {
        res.status(200).json(getBlogs);
      } else {
        
          res.status(404).json({
            message: "No Blogs Found found.",
          })
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update status of a blog
 * @param req
 * @param res
 * @param next
 */
export const updateBlogStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
       res.status(400).json({message: 'ID and status are required'  });
      }
  
    // Validate if the provided status is a valid enum value
    if (!Object.values(BlogsStatusInfo).includes(status)) {
       res.status(400).json({ message: 'Invalid status provided' });
    }

    // Find the blog by blogId and update its status
    const updatedBlog = await prisma.blogs.updateMany({
        where: {
          id,
        },
        data: {
          status,
        },
      });

    if (updatedBlog.count > 0) {
      res.status(200).json({
        data:updatedBlog,
        message:`Blog status updated to ${status}`
    });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * delete blog
 * @param req
 * @param res
 * @param next
 */
export const deteleBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogIdValidation = await BlogIdValidationService.validateBlogId(
      req.params.blogId
    );

    if (!blogIdValidation) {
      
        res.status(400).json({
          message: "Operation failed, invalid details provided.",
        })
    } else {
        const deleteBlogs = await prisma.blogs.delete({
            where: { id: blogIdValidation },
          });
          
      if (deleteBlogs) {
        res.status(200).json(deleteBlogs);
      } else {
        
          res.status(404).json({
            message: "Not found.",
          })
      }
    }
  } catch (error) {
   
    next(error);
  }
};

/**
 * Update blog
 * @param req
 * @param res
 * @param next
 */
export const updateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resUpdateBlogValidation: IUpadateBlog = await BlogValidationService.validateUpdateBlog(
      req.body
    );

    if (!resUpdateBlogValidation) {
      
        res.status(400).json({
          message: "Operation failed, invalid details provided.",
        })
    } else {
        const updatedBlog = await prisma.blogs.update({
            where: { id: resUpdateBlogValidation.blogId },
            data: {
              title: resUpdateBlogValidation.title,
              description: resUpdateBlogValidation.description,
              image: resUpdateBlogValidation.image,
              author: resUpdateBlogValidation.author,
              categories: resUpdateBlogValidation.categories,
              cryptoSymbol: resUpdateBlogValidation.cryptoSymbol,
            },
          });

      if (updatedBlog) {
        res.status(200).json({
            data:updatedBlog
        });
      } else {
        
          res.status(404).json({
            message: "Not found.",
          })
      }
    }
  } catch (error) {
   
    next(error);
  }
};

/**
 * get one Crypto
 * @param req
 * @param res
 * @param next
 */
export const getCryptoInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogIdValidation = await CryptoIdValidationService.validateCryptoId(
      req.params.cryptoId
    );
   const cryptoData= await fetchCryptoData(blogIdValidation)

     res.status(200).json({
      data:cryptoData
    });

  } catch (error) {
   
    next(error);
  }
};