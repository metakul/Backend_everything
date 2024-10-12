import { Request, Response, NextFunction } from "express";
import { IUpadateBlog, Iblog } from "../../DataTypes/interfaces/IBlog.js";
import { fetchCryptoData } from "../../Utils/scripts/AxiosCall.js";
import { prisma } from "../../db/client.js";
import { BlogsStatusInfo } from "../../DataTypes/enums/IUserEnums.js";
import { BlogIdValidationService, BlogValidationService, CryptoIdValidationService } from "../../Validation/BlogValidation.js";
import { RequestWithUser } from "../../Middleware/checkJwt.js";
import { BlogsError } from "../../DataTypes/enums/Error.js";

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
          status: BlogsStatusInfo.PENDING
        },
      });
    return blog;

  } catch (error) {
    console.log(error);
    throw BlogsError.ErrorAddingBlog();
  }
};

/**
 * Create a new blog
 * @param req
 * @param res
 * @param next
 */
export const CreateBlog = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogModelValidation: Iblog | undefined = await BlogValidationService.validateCreateBlog(
        req.body
      );

    if (!blogModelValidation) {
      throw BlogsError.InvalidBlogDetails(blogModelValidation);
    } else {
      const newBlog = await addBlog(blogModelValidation);
      res.status(201).json(
        newBlog);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get all blogs based on status, sorted by the latest update
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

    // Validate the status query parameter
    if (!status || (status !== BlogsStatusInfo.APPROVED && status !== BlogsStatusInfo.PENDING)) {
      throw BlogsError.InvalidStatusProvided();
    }

    // Pagination parameters
    const pageSize = parseInt(req.query.pagesize as string, 10) || 10;
    const page = parseInt(req.query.page as string, 10) || 1;
    const skip = (page - 1) * pageSize;

    // Query the blogs, sorted by 'updatedAt' in descending order
    const blogs = await prisma.blogs.findMany({
      where: {
        status: status || BlogsStatusInfo.APPROVED, // Default to APPROVED if status is not provided
      },
      skip: skip,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc', // Sort by latest updates first
      },
    });

    if (blogs.length > 0) {
      res.status(200).json(blogs);
    } else {
      throw BlogsError.BlogNotFound();
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
      throw BlogsError.InvalidBlogDetails(blogIdValidation);
    } else {
      const getBlogs = await prisma.blogs.findMany({
        where: {
          id: req.params.blogId,
        },
      });

      if (getBlogs.length > 0) {
        res.status(200).json(getBlogs);
      } else {
        throw BlogsError.BlogNotFound();
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
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { blogId } = req.params;
    const { status } = req.body;

    if (!blogId || !status) {
      throw BlogsError.InvalidBlogDetails(blogId);
    }
  
    if (!Object.values(BlogsStatusInfo).includes(status)) {
      throw BlogsError.InvalidStatusProvided();
    }

    const updatedBlog = await prisma.blogs.updateMany({
        where: {
          id:blogId,
        },
        data: {
          status,
        },
      });

      if (updatedBlog.count > 0) {
        // Retrieve the updated blog data
        const updatedBlogData = await prisma.blogs.findUnique({
          where: {
            id: blogId,
          },
        });
        res.status(200).json(updatedBlogData);
    } else {
      throw BlogsError.BlogNotFound();
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
export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogIdValidation = await BlogIdValidationService.validateBlogId(
      req.params.blogId
    );

    if (!blogIdValidation) {
      throw BlogsError.InvalidBlogDetails(blogIdValidation);
    } else {
      const deleteBlogs = await prisma.blogs.delete({
          where: { id: blogIdValidation },
        });
        
      if (deleteBlogs) {
        res.status(200).json(deleteBlogs);
      } else {
        throw BlogsError.BlogNotFound();
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
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const resUpdateBlogValidation: IUpadateBlog = await BlogValidationService.validateUpdateBlog(
      req.body
    );

   
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
        res.status(200).json(
            updatedBlog
        );
      } else {
        throw BlogsError.BlogNotFound();
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

    if (!blogIdValidation) {
      throw BlogsError.InvalidBlogDetails(blogIdValidation);
    } else
    {

      const cryptoData = await fetchCryptoData(blogIdValidation);
      
      res.status(200).json(cryptoData);
    }

  } catch (error) {
    next(error);
  }
};
