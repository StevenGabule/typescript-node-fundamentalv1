import {Express, Request, Response} from "express";
import {createUserHandler} from "./controller/user.controller";
import {validateRequest, requireUser} from "./middleware";
import {creatUserSchema, creatUserSessionSchema} from "./schema/user.schema";
import {
    createUserSessionHandler,
    getUserSessionsHandler,
    invalidateUserSessionHandler
} from "./controller/session.controller";
import {createPostSchema, deletePostSchema, updatePostSchema} from "./schema/post.schema";
import {createPostHandler, deletePostHandler, getPostHandler, updatePostHandler} from "./controller/post.controller";

export default function(app: Express) {
    app.get('/health-check', (req: Request, res: Response) => {
        res.sendStatus(200)
    })

    // register user
    app.post('/api/users', validateRequest(creatUserSchema), createUserHandler);

    // login user
    app.post('/api/sessions', validateRequest(creatUserSessionSchema), createUserSessionHandler);

    // get the user's sessions
    app.get('/api/sessions', requireUser, getUserSessionsHandler)

    // logout
    // delete api/sessions
    app.delete('/api/sessions', requireUser, invalidateUserSessionHandler)

    // create a post
    app.post('/api/posts', [requireUser, validateRequest(createPostSchema)], createPostHandler);

    // update a post
    app.put('/api/posts/:postId', [requireUser, validateRequest(updatePostSchema)], updatePostHandler);

    // get a post
    app.get('/api/posts/:postId', getPostHandler);

    // delete a post
    app.delete('/api/posts/:postId', [requireUser, validateRequest(deletePostSchema)], deletePostHandler);

}
