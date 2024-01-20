import bcryptjs from "bcryptjs";
import authModel from "../models/authModel.js";
import jwt from "jsonwebtoken";
class AuthController {
  static userRegistration = async (req, res) => {
    const { username, email, password } = req.body;
    try {
      if (username && email && password) {
        const isUser = await authModel.findOne({ email: email });
        if (!isUser) {
          //password
          const genSalt = await bcryptjs.genSalt(10);
          const hashPassword = await bcryptjs.hash(password, genSalt);

          // save a User

          const newUser = authModel({
            username,
            email,
            password: hashPassword,
          });

          const saveUser = await newUser.save();
          if (saveUser) {
            return res
              .status(200)
              .json({ message: "User Registration Successfully" });
          }
        } else {
          return res.status(400).json({ message: "Email Already Exist" });
        }
      } else {
        return res.status(400).json({ message: "all fields are required" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };

  static userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
      if (email && password) {
        const isEmail = await authModel.findOne({ email: email });
        if (isEmail) {
          if (
            isEmail.email === email &&
            (await bcryptjs.compare(password, isEmail.password))
          ) {
            //generated token
            const token = jwt.sign({ userID: isEmail._id }, "pleaseSubscribe", {
              expiresIn: "2d",
            });
            return res.status(200).json({
              message: "Login Successfully",
              token,
              name: isEmail.username,
            });
          } else {
            return res.status(400).json({ message: "Wrong Credentials" });
          }
        } else {
          return res.status(400).json({ message: "Email ID is not Found" });
        }
      } else {
        return res.status(400).json({ message: "all fields are required" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  };
}
export default AuthController;
