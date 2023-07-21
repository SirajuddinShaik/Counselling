require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const path = require("path");
const bcrypt = require("bcrypt");
const { Console, log } = require("console");
const { type } = require("os");
const salts = 10;

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/consellingDB");

const securitySchema = mongoose.Schema({
  securityKey: String,
  _id: String,
});

var user = { type: "student", id: "21BQ1A05P1" };

const studentSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  src: String,
  password: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  _id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  regdno: String,
  mobile: Number,
  adress: String,
  fatherName: String,
  fmobile: Number,
  motherName: String,
  mmobile: Number,
  attendance: Number,
  branch: String,
  feePaid: Number,
  totalFee: Number,
  studentMessage: String,
  counsellerMessage: String,
  counsellerId: String,
});

const counsellerSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  src: String,
  password: {
    type: String,
    required: true,
  },
  fname: {
    type: String,
    // required:true
  },
  mName: String,
  lname: {
    type: String,
    // required:true
  },
  uniqueId: {
    type: String,
    // required:true
  },
  mobile: Number,
  adress: String,
  branch: String,
  subject: String,
  counsellingStudents: [studentSchema],
  hodname: String,
  counsellerMessage: String,
  adminMessage: String,
  email: String,
});
const counsellerScheme = {
  _id: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  branch: String,
};

const adminSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  src: String,
  password: {
    type: String,
    required: true,
  },
  fName: {
    type: String,
    // required:true
  },
  mName: String,
  lName: {
    type: String,
    // required:true
  },
  uniqueId: {
    type: String,
    // required:true
  },
  mobile: Number,
  adress: String,
  branch: String,
  subject: String,
  counsellers: [counsellerScheme],
  counsellerMessage: String,
});

const Student = mongoose.model("Student", studentSchema);
const Counseller = mongoose.model("counseller", counsellerSchema);
const Admin = mongoose.model("admin", adminSchema);
const Security = mongoose.model("security", securitySchema);

app.route("/").get(function (req, res) {
  res.render("home");
});

app
  .route("/add/:type/:cname")
  .get(function (req, res) {
    if (user.type === req.params.type && user.id === req.params.cname)
      res.render("add", {
        type1: "/counseller/" + req.params.cname,
        type: 3,
        name: req.params.cname,
      });
    else {
      res.redirect("/");
    }
  })
  .post(function (req, res) {
    const type = req.params.type;
    const cname = req.params.cname;
    if (user.type === req.params.type && user.id === req.params.cname) {
      console.log("admin");
      if (type === "counseller") {
        let username = _.toUpper(req.body.regdno);
        Student.findById(username, function (err, found) {
          if (!found) {
            console.log("hlo", username);

            bcrypt.hash(username, salts, function (err, hash) {
              const newstudent = new Student({
                username: username,
                password:
                  "$2b$10$DWd0kV2PKKs6TmUpJfFztevSbXN0MZyxjQhsmdDHizMI3Ts/dGEhy",
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                mobile: req.body.mobile,
                adress: req.body.address,
                fatherName: req.body.fatherName,
                motherName: req.body.motherName,
                attendance: req.body.attendance,
                branch: req.body.branch,
                totalFee: req.body.totalFee,
                feePaid: req.body.fee,
                fmobile: req.body.fmobile,
                mmobile: req.body.mmobile,
                regdno: req.body.regdno,
                _id: req.body.regdno,
                studentMessage: "",
                counsellerMessage: "",
                counsellerId: cname,
              });
              newstudent.save();
              Counseller.findOne({ username: cname }, function (err, foundc) {
                if (foundc) {
                  foundc.counsellingStudents.push(newstudent);
                  foundc.save();
                  res.redirect("/counseller/" + cname);
                } else {
                  res.redirect("/login");
                }
              });
            });
          } else {
            res.redirect("/login");
          }
        });
      } else if (type === "admin") {
        console.log("admin1");
        const id = req.body.uniqueId;
        Counseller.findOne({ uniqueId: id }, function (err, found) {
          if (found) {
            Admin.findOne({ username: cname }, function (err1, found1) {
              if (found1) {
                found.hodname = found1.fName + found1.lName;
                found1.counsellers.push({
                  _id: found.uniqueId,
                  fullName: found.fname + " " + found.lname,
                  branch: found.branch,
                });
                found1.save();
                res.redirect("/administrator/" + cname);
              } else {
              }
            });
          } else {
            res.redirect("/administrator/" + cname);
          }
        });
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  });

app
  .route("/changepassword")
  .get(function (req, res) {
    res.render("changePW");
  })
  .post(function (req, res) {
    let ch = req.body.type;
    let username = req.body.username;
    let currentPass = req.body.currentPass;
    let newPass = req.body.newPass;
    let confirmPass = req.body.confirmNewPass;
    // console.log("suc",newPass,confirmPass);
    if (newPass === confirmPass) {
      switch (ch) {
        case "1":
          Admin.findOne({ username: username }, function (err, found) {
            if (found) {
              bcrypt.compare(
                currentPass,
                found.password,
                function (err1, result) {
                  if (result) {
                    bcrypt.hash(newPass, salts, function (err2, hash) {
                      found.password = hash;
                      found.save();
                      res.redirect("/admin/" + found.username);
                    });
                  } else {
                    res.redirect("/changepassword");
                  }
                }
              );
            } else {
              res.redirect("/changepassword");
            }
          });
          break;

        case "2":
          Counseller.findOne({ username: username }, function (err, found) {
            if (found) {
              bcrypt.compare(
                currentPass,
                found.password,
                function (err1, result) {
                  if (result) {
                    bcrypt.hash(newPass, salts, function (err2, hash) {
                      found.password = hash;
                      found.save();
                      res.redirect("/counseller/" + found.username);
                    });
                  } else {
                    res.redirect("/changepassword");
                  }
                }
              );
            } else {
              res.redirect("/changepassword");
            }
          });
          break;

        case "3":
          Student.findOne({ username: username }, function (err, found) {
            if (found) {
              bcrypt.compare(
                currentPass,
                found.password,
                function (err1, result) {
                  if (result) {
                    bcrypt.hash(newPass, salts, function (err2, hash) {
                      found.password = hash;
                      found.save();
                      res.redirect("/student/" + found.username);
                    });
                  } else {
                    res.redirect("/changepassword");
                  }
                }
              );
            } else {
              res.redirect("/changepassword");
            }
          });
          break;

        default:
          res.redirect("/changepassword");
          break;
      }
    } else {
      res.redirect("/changepassword");
    }
  });
app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    let ch = req.body.type;
    let username = req.body.username;
    let password = req.body.password;
    console.log(ch);
    switch (ch) {
      case "1":
        Admin.findOne({ username: username }, function (err, found) {
          if (found) {
            bcrypt.compare(password, found.password, function (err1, result) {
              if (result) {
                user.type = "administrator";
                user.id = found.username;
                res.redirect("/administrator/" + found.username);
              } else {
                console.log("wrong password");
                res.redirect("/login");
              }
            });
          } else {
            res.redirect("/login");
          }
        });
        break;
      case "2":
        Counseller.findOne({ username: username }, function (err, found) {
          if (found) {
            console.log("sucess");
            bcrypt.compare(password, found.password, function (err1, result) {
              if (result) {
                user.type = "counseller";
                user.id = found.username;
                res.redirect("/counseller/" + found.username);
              } else {
                console.log("wrong password");
                res.redirect("/login");
              }
            });
          } else {
            res.redirect("/login");
          }
        });
        break;
      case "3":
        Student.findOne({ username: username }, function (err, found) {
          if (found) {
            bcrypt.compare(password, found.password, function (err1, result) {
              if (result) {
                user.type = "student";
                user.id = found._id;
                res.redirect("/student/" + found._id);
              } else {
                console.log("wrong password");
                res.redirect("/login");
              }
            });
          } else {
            res.redirect("/login");
          }
        });
        break;

      default:
        res.redirect("/login");
        break;
    }
  });

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    if (req.body.password === req.body.confirmPassword) {
      let username = req.body.username;
      Security.findById("vvit123", function (err, found) {
        if (!err) {
          bcrypt.compare(
            req.body.securityKey,
            found.securityKey,
            function (err, result) {
              if (result) {
                if (req.body.type === "2") {
                  Counseller.findOne(
                    { username: username },
                    function (err1, exist) {
                      if (!exist) {
                        bcrypt.hash(
                          req.body.password,
                          salts,
                          function (err2, hash) {
                            if (!err2) {
                              new Counseller({
                                username: username,
                                password: hash,
                              }).save();
                              user.type = "counseller";
                              user.id = username;
                              res.redirect("/login");
                            } else {
                              res.redirect("/register");
                              console.log("alert(Unknown Error1!");
                            }
                          }
                        );
                      } else {
                        res.redirect("/register");
                        console.log("alert(User Already Exist!");
                      }
                    }
                  );
                } else if (req.body.type === "1") {
                  Admin.findOne({ username: username }, function (err1, exist) {
                    if (!exist) {
                      bcrypt.hash(
                        req.body.password,
                        salts,
                        function (err2, hash) {
                          if (!err2) {
                            new Admin({
                              username: username,
                              password: hash,
                            }).save();
                            user.type = "adminstator";
                            user.id = username;
                            res.redirect("/login");
                          } else {
                            res.redirect("/register");
                            console.log("alert(Unknown Error2!");
                          }
                        }
                      );
                    } else {
                      res.redirect("/register");
                      console.log("alert(User Already Exist!");
                    }
                  });
                } else {
                  res.redirect("/register");
                  console.log("alert(Unknown Error3!");
                }
              } else {
                res.redirect("/register");
                console.log("alert(Security Key Is Wrong!");
              }
            }
          );
        } else {
          res.redirect("/register");
          console.log("alert(Unknown Error4!");
        }
      });
    } else {
      res.redirect("/register");
      console.log("alert(Password Must be Same!");
    }
  });

app.post("/send/:type/:name", function (req, res) {
  const name = req.params.name;
  const type = req.params.type;
  if (user.id === name && user.type === type) {
    const message = req.body.message;
    if (type === "counseller") {
      Student.updateMany(
        { counsellerId: name },
        { counsellerMessage: message },
        null,
        function (err, docs) {
          if (!err) {
            console.log(docs);
          }
        }
      );
      res.redirect("/" + type + "/" + name);
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

app
  .route("/:type/:tname/:name")
  .get(function (req, res) {
    const type = req.params.type;
    const tname = req.params.tname;
    const name = req.params.name;
    if (user.type === type && user.id === tname) {
      if (name === "profile") {
        if (type === "counseller") {
          Counseller.findOne({ username: tname }, function (err, found) {
            if (found) {
              res.render("profile", {
                type1: "/" + type + "/" + tname,
                name: "profile",
                type: 2,
                details: found,
              });
            }
          });
        } else if (type === "admin") {
          Admin.findOne({ username: tname }, function (err, found) {
            if (found) {
              res.render("profile", {
                type1: "/" + type + "/" + tname,
                name: "profile",
                type: 1,
                details: found,
              });
            }
          });
        } else if (type === "student") {
          Student.findById(tname, function (err, found) {
            if (found) {
              res.render("profile", {
                type1: "/" + type + "/" + tname,
                name: "profile",
                type: 3,
                details: found,
              });
            }
          });
        } else {
          res.redirect("/");
        }
      } else if (type === "counseller") {
        Student.findById(req.params.name, function (err, found) {
          if (!err) {
            res.render("profile", {
              type1: "/" + type + "/" + tname,
              name: name,
              type: 3,
              details: found,
            });
          }
        });
      } else if (type === "admin") {
        Counseller.findOne({ uniqueId: name }, function (err, found) {
          if (!err) {
            res.render("counseller", {
              cname: found.username,
              students: found.counsellingStudents,
            });
          }
        });
      }
    } else {
      res.redirect("/");
    }
  })
  .post(function (req, res) {});

app.route("/:type/:name").get(function (req, res) {
  const name = req.params.name;
  const type = req.params.type;
  if (user.id === name && user.type === type) {
    if (type === "counseller") {
      Counseller.findOne({ username: name }, function (err, found) {
        if (!err) {
          res.render("counseller", {
            cname: found.username,
            students: found.counsellingStudents,
            type: 2,
          });
        }
      });
    } else if (type === "administrator") {
      Admin.findOne({ username: name }, function (err, found) {
        if (!err) {
          res.render("admin", {
            name: found.username,
            counsellors: found.counsellers,
          });
        }
      });
    } else if (type === "student") {
      Student.findById(name, function (err, found) {
        if (found) {
          res.render("student", { details: found, name: req.params.name });
        }
      });
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});

app.post("/save/:type/:tname/:name", function (req, res) {
  const type = req.params.type;
  const name = req.params.tname;
  if (user.id === name && user.type === type) {
    let name;
    if (req.params.name === "profile") {
      console.log("hle");
      name = req.params.tname;
    } else {
      name = req.params.name;
    }

    // const updates={
    //     fname:req.body.fname,
    //     lname:req.body.lname,
    //     email:req.body.email,
    //     mobile:req.body.mobile,
    //     adress:req.body.adress,
    //     fatherName:req.body.fatherName,
    //     attendance:req.body.attendance,
    //     feePaid:req.body.feePaid
    // }
    switch (req.body.type) {
      case "1":
        Admin.findOneAndUpdate(
          { username: name },
          {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            mobile: req.body.mobile,
            adress: req.body.adress,
            regdno: req.body.regdno,
            branch: req.body.branch,
          },
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );

        break;
      case "2":
        Counseller.findOneAndUpdate(
          { username: name },
          {
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            mobile: req.body.mobile,
            adress: req.body.address,
            regdno: req.body.regdno,
            branch: req.body.branch,
          },
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
        break;

      case "3":
        if (req.params.name === "profile") {
          Student.findOneAndUpdate(
            { username: name },
            {
              email: req.body.email,
              mobile: req.body.mobile,
              adress: req.body.address,
              fatherName: req.body.fatherName,
              motherName: req.body.motherName,
              mmobile: req.body.mmobile,
              studentMessage: req.body.sMessage,
            },
            function (err) {
              if (err) {
                console.log(err);
              }
            }
          );
        } else {
          Student.findOneAndUpdate(
            { username: name },
            {
              fname: req.body.fname,
              lname: req.body.lname,
              email: req.body.email,
              mobile: req.body.mobile,
              adress: req.body.address,
              fatherName: req.body.fatherName,
              motherName: req.body.motherName,
              attendance: req.body.attendance,
              branch: req.body.branch,
              feePaid: req.body.feePaid,
              fmobile: req.body.fmobile,
              mmobile: req.body.mmobile,
              regdno: req.body.regdno,
            },
            function (err) {
              if (err) {
                console.log(err);
              }
            }
          );
        }

        break;

      default:
        res.redirect("/");
        break;
    }
    res.redirect(
      "/" + req.params.type + "/" + req.params.tname + "/" + req.params.name
    );
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  user = { type: "", id: "" };
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server live at port:3000");
});
