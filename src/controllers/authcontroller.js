const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
class AuthController {
  async register(req, res, next) {
    try {
      const { first_name, last_name, email, phone, password, favorite } =
        req.body;
      const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
      const saved = await db.User.create({
        first_name,
        last_name,
        email,
        phone,
        password: hash,
        favorite,
      });
      const accessToken = jwt.sign(
        {
          id: saved.id,
          is_admin: false,
        },
        "chaybothoi",
        { expiresIn: "5m" }
      );
      const refreshToken = jwt.sign(
        {
          id: saved.id,
          is_admin: false,
        },
        "chaybothoied",
        { expiresIn: "365d" }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      const { hash: _hash, ...others } = saved.dataValues;
      return res.status(201).json({ accessToken, refreshToken, user: others });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error!!!" });
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const item = await db.User.findOne({
        where: {
          email,
        },
      });
      if (!item) {
        return res
          .status(500)
          .json({ message: "Email hoặc mật khẩu không đúng" });
      }
      const result = bcrypt.compareSync(password, item.password);
      if (!result) {
        return res
          .status(500)
          .json({ message: "Email hoặc mật khẩu không đúng" });
      }
      const accessToken = jwt.sign(
        {
          id: item.id,
          is_admin: item.is_admin,
        },
        "chaybothoi",
        { expiresIn: "5m" }
      );
      const refreshToken = jwt.sign(
        {
          id: item.id,
          is_admin: item.is_admin,
        },
        "chaybothoied",
        { expiresIn: "365d" }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      const { hash: _hash, ...others } = item.dataValues;
      return res.status(201).json({ accessToken, refreshToken, user: others });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error!!!" });
    }
  }
  async logout(req, res, next) {
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Đăng xuất thành công" });
  }
  async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (token) {
        const payload = jwt.verify(token, "chaybothoied");
        const accessToken = jwt.sign({
          is_admin: payload.is_admin,
          id: payload.id,
        });
        return res.status(200).json({ accessToken });
      }
    } catch (error) {
      console.log("REFRESH TOKEN ERROR", error);
    }
    return res.status(500).json({ message: "Error!!!" });
  }
}

const authController = new AuthController();

module.exports = authController;
