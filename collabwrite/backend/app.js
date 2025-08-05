//password: admin

const cors = require('cors');
const express = require("express");
const mongoose = require("mongoose");
const Router = require("./Routes/UserRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/USERS", Router);//Middleware: "For any request that starts with /users, use the routes defined in the router (imported from ./Routes/UserRoutes)."




mongoose
    .connect("mongodb+srv://admin:admin@collabwritecluster.qfwyw9d.mongodb.net/")
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch((err) => console.log(err));



//Register-----------------
//Call Register Model
require("./Models/UserModels");
const User = mongoose.model("register");
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        await User.create({
            name,
            email,
            password,
        });
        res.send({ status: "ok" });
    } catch (err) {
        res.send({ status: "err" });
    }
});


//Login______________________
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.json({ status: "error", data: "Invalid email or password" });
        }
        if (user.password !== password) {
            return res.json({ status: "error", data: "Invalid email or password" });
        } else {
            res.json({ status: "ok", data: user[0] });

        }
    } catch (err) {
        console.log(err);
        res.json({ status: "error", data: "An error occurred" });
    }
});