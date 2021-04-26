const express = require("express");
const pool = require(__dirname + '/database.js');
const ejs = require("ejs");
//const ejsLint = require("ejs-lint");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

var univArray = [];

app.get('/', (req, res) => {

    univArray = [];

    pool.query("SELECT * FROM university", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < result.length; i++) {
                univArray.push(result[i].UNAME);
            }
            res.render('home', { pageTitle: "Home", universityList: univArray });
        }
    });
});

var collegeArray = [];
var uName;

app.post("/university", (req, res) => {

    uName = req.body.uName;

    res.render("home", {pageTitle: "University", uname: uName});

});

var percentage = [];
var exam = [];
var subject = [];

app.post("/details", (req, res) => {

    let univ = req.body.univ;

    if(univ === 'Colleges') {
    
        const query1 = "SELECT * FROM college,university WHERE UNO=UNUM AND UNAME LIKE '%" + uName + "%'";
        collegeArray = [];
        pool.query(query1, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < result.length; i++) {
                    collegeArray.push(result[i].COLLEGE_NAME);
                }

                res.render("home", { pageTitle: "College", uname: uName, collegeList: collegeArray });
            }
        });

    } else {

        exam = [];
        subject = [];
        percentage = [];
        courseArray = [];

        const query6 = "SELECT CNAME,MIN_PERCENTAGE,QUALIFIER_EXAM,SUBJECT_REQUIRED FROM ELIGIBILITY,COURSE,UNIVERSITY WHERE UNO=UNUMBER AND PAPER_CODE=COURSE_CODE AND UNAME='" + uName + "'";
        pool.query(query6, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                
                for (var i = 0; i < result.length; i++) {
                    courseArray.push(result[i].CNAME);
                    subject.push(result[i].SUBJECT_REQUIRED);
                    exam.push(result[i].QUALIFIER_EXAM);
                    percentage.push(result[i].MIN_PERCENTAGE);
                }

                res.render("home", { pageTitle: "University-Courses", uname: uName, courseList: courseArray, minPercentage: percentage, qualifierExam: exam, subjectRequired: subject });
            }
        });
    }
});

var location = '';
var mail = '';
var grade = '';
var rank = '';

app.post("/college", (req, res) => {

    let cName = req.body.cName;

    const query2 = 'SELECT LOCATION,EMAIL,RANK,GRADE FROM campus,college WHERE AFFILIATION_NUMBER=AFF_NUMBER AND COLLEGE_NAME="' + cName + '"';

    pool.query(query2, (err, result1) => {

        if (!err) {
        
            location = result1[0].LOCATION;
            mail = result1[0].EMAIL;
            if (result1[0].RANK === null || result1[0].GRADE === null) {
                rank = grade = 'NA'; 
            } else {
                grade = result1[0].GRADE;
                rank = result1[0].RANK;
            }
            const query5 = "SELECT CNAME,FEES_PER_ANNUM FROM course,offers,college WHERE AFFILIATION_NUMBER=AFF_NUM AND COURSE_NUM=PAPER_CODE AND COLLEGE_NAME LIKE '%" + cName + "%'";

            pool.query(query5, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    fees = [];
                    courseArray = [];
                    for (let i = 0; i < result.length; i++) {
                        courseArray.push(result[i].CNAME);
                        fees.push(result[i].FEES_PER_ANNUM);
                    }
                    // console.log(courseArray);
                    // console.log(fees);
                    res.render("home", {pageTitle: cName, grade1: grade, rank1: rank, courseList: courseArray, feesList: fees, address: location, contact: mail});
                }
            });

        } else {
            console.log(err);
        }
    });
});

var categoryArray = [];

app.get("/course", (req, res) => {

    categoryArray = [];

    pool.query("SELECT DISTINCT(CATEGORY) FROM course", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < result.length; i++) {
                categoryArray.push(result[i].CATEGORY);
            }

            res.render("course", { pageTitle: "Domains", categoryList: categoryArray });
        }
    });

});

var courseArray = [];

app.post("/course", (req, res) => {

    let courseCategory = req.body.categoryName;

    const query3 = "SELECT * FROM course WHERE CATEGORY LIKE '%" + courseCategory + "%'";

    courseArray = [];

    pool.query(query3, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < result.length; i++) {
                courseArray.push(result[i].CNAME);
            }

            res.render("course", { pageTitle: "Courses", courseList: courseArray, domain: courseCategory });
        }
    })
});

var fees = [];

app.post("/offered-by", (req, res) => {

    let selectedCourse = req.body.courseName;

    const query4 = "select college_name,fees_per_annum,uname from college,offers,university,course where course_num=paper_code and affiliation_number=aff_num and uno=unum and cname like '%" + selectedCourse + "%'";
    
    fees = [];
    univArray = [];
    collegeArray = [];

    pool.query(query4, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            
            for (var i = 0; i < result.length; i++) {
                
                collegeArray.push(result[i].college_name);
                fees.push(result[i].fees_per_annum);
                univArray.push(result[i].uname);
            }
            // console.log(univArray);
            // console.log(collegeArray);
            // console.log(fees);
            res.render("course", { pageTitle: "Offered-By", collegeList: collegeArray, univList: univArray, feesList: fees, course: selectedCourse });
        }
    });
});







//listening to port
const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log("Server running at port 3000..");
});

