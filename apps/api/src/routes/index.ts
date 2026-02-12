import { Router } from "express";
import Paths from "../common/Paths";
import UserRoutes from "./UserRoutes";
import { getHtml } from "../services/wx";

// **** Variables **** //

const apiRouter = Router();

// ** Add UserRouter ** //

// Init router
const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);

apiRouter.post("/wx-md", (req, res) => {
  getHtml(req.body as any)
    .then((html) =>
      res.json({
        success: true,
        data: html,
      })
    )
    .catch((e) => {
      res.json({
        success: false,
        error: e.message,
      });
    });
});

export default apiRouter;
