import { Request, Response, NextFunction } from "express";
import { prisma } from "../../db/client.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Add a new course
 * @param req
 * @param res
 * @param next
 */
export const addCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, topics } = req.body;

    // Ensure all topic IDs are valid UUIDs
    const formattedTopics = topics.map((topic: any) => ({
      ...topic,
      id: uuidv4(),
    }));

    const newCourse = await prisma.course.create({
      data: {
        name,
        topics: {
          create: formattedTopics,
        },
      },
    });

    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};

/**
 * Add new topics to an existing course
 * @param req
 * @param res
 * @param next
 */
export const addTopicsToCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const { topics } = req.body;

    // Ensure all topic IDs are valid UUIDs
    const formattedTopics = topics.map((topic: any) => ({
      ...topic,
      id: uuidv4(),
    }));

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        topics: {
          create: formattedTopics,
        },
      },
      include: {
        topics: true,
      },
    });

    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses
 * @param req
 * @param res
 * @param next
 */
export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allCourses = await prisma.course.findMany({
      include: {
        topics: true,
      },
    });

    res.status(200).json(allCourses);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single course by ID
 * @param req
 * @param res
 * @param next
 */
export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        topics: true,
      },
    });

    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ error: "Course not found" });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a course by ID
 * @param req
 * @param res
 * @param next
 */
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;

    const deletedCourse = await prisma.course.delete({
      where: { id: courseId },
    });

    res.status(200).json(deletedCourse);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a single topic from a course
 * @param req
 * @param res
 * @param next
 */
export const deleteTopicFromCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, topicId } = req.params;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        topics: {
          delete: { id: topicId },
        },
      },
      include: {
        topics: true,
      },
    });

    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a single topic inside a course
 * @param req
 * @param res
 * @param next
 */
export const updateTopicInCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, topicId } = req.params;
    const { title, content } = req.body;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        topics: {
          update: {
            where: { id: topicId },
            data: { title, content },
          },
        },
      },
      include: {
        topics: true,
      },
    });

    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
};