import express from "express";
import {
  addCourse,
  addTopicsToCourse,
  getAllCourses,
  getCourseById,
  deleteCourse,
  deleteTopicFromCourse,
  updateTopicInCourse,
} from "../../Controllers/Courses/CoursesController.js";
import checkJwt from "../../Middleware/checkJwt.js";
import { UserCategory } from "../../DataTypes/enums/IUserEnums.js";

const router = express.Router();

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Add a new course
 *     tags:
 *       - Courses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "UniswapCourse"
 *               topics:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Introduction to Uniswap"
 *                     content:
 *                       type: string
 *                       example: "Content for Uniswap Introduction"
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/courses",checkJwt([UserCategory.SUPER_ADMIN]), addCourse);

/**
 * @swagger
 * /courses/{courseId}/topics:
 *   post:
 *     summary: Add new topics to an existing course
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topics:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "New Topic Title"
 *                     content:
 *                       type: string
 *                       example: "Content for the new topic"
 *     responses:
 *       200:
 *         description: Topics added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/courses/:courseId/topics",checkJwt([UserCategory.SUPER_ADMIN]), addTopicsToCourse);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags:
 *       - Courses
 *     responses:
 *       200:
 *         description: List of all courses
 *       500:
 *         description: Internal server error
 */
router.get("/courses", getAllCourses);

/**
 * @swagger
 * /courses/{courseId}:
 *   get:
 *     summary: Get a course by ID
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.get("/courses/:courseId", getCourseById);

/**
 * @swagger
 * /courses/{courseId}:
 *   delete:
 *     summary: Delete a course by ID
 *     tags:
 *       - Courses
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.delete("/courses/:courseId",checkJwt([UserCategory.SUPER_ADMIN]), deleteCourse);

/**
 * @swagger
 * /courses/{courseId}/topics/{topicId}:
 *   delete:
 *     summary: Delete a topic from a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the topic
 *     responses:
 *       200:
 *         description: Topic deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete("/courses/:courseId/topics/:topicId", checkJwt([UserCategory.SUPER_ADMIN]), deleteTopicFromCourse);

/**
 * @swagger
 * /courses/{courseId}/topics/{topicId}:
 *   put:
 *     summary: Update a topic in a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Topic updated successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.put("/courses/:courseId/topics/:topicId", checkJwt([UserCategory.SUPER_ADMIN]), updateTopicInCourse);

export default router;