var express = require('express');
var mysql = require('mysql');
var jwt = require('jsonwebtoken')
var multiparty = require('multiparty');  //文件上传解析插件
var router = express.Router();


const TOKEN_KEY = '0528'//token密匙

var con = mysql.createConnection({//链接数据库
  host: 'localhost',//数据库地址
  user: 'root',
  password: 'root',
  database: 'studentserve'
})

con.connect()//连接到数据库




//-------------------------------------登录------------------------------//
router.post('/login', function (req, res) {
  var acc = req.body.acc
  var pwd = req.body.pwd

  var sql = `SELECT * FROM user WHERE account='${acc}' && password='${pwd}'`

  con.query(sql, (err, data) => {
    if (err) throw err;
    if (data.length != 0) {
      let token = jwt.sign({}, TOKEN_KEY, {
        expiresIn: 60 * 30 //秒
      });
      res.send({
        msg: 'ok',
        token,
        userGroup: data[0].userGroup,
        name: data[0].name,
      })
    } else {
      res.send({
        mag: 'fail'
      })
    }
  })
});


//----------------------------TOKEN验证-------------------------//
router.get('/getToken', function (req, res) {
  let token = req.query.token
  jwt.verify(token, TOKEN_KEY, (err, decode) => {
    if (err) {
      res.send('timeout')
    } else {
      res.send('valid')
    }
  })
})



//--------------------------请求学生信息--------------------------//

router.post('/getstudentlist', function (req, res) {
  let pagecell = req.body.pagecell //每页显示的条数
  let page = req.body.page //当前请求第几页的数据

  let searchName = req.body.searchName  //搜索的商品名
  let searchCategory = req.body.searchCategory //搜索的分类
  if (searchCategory == -1) {
    return searchCategory = ''
  }

  let sql;
  let totalsql;
  if (searchName && searchCategory != '') {
    //带模糊查询的语句(模糊查询)
    sql = `SELECT * FROM studenttable WHERE name LIKE '%${searchName}%' && grade=${searchCategory} LIMIT ${(page - 1) * pagecell}, ${pagecell}`
    totalsql = `select count(*) from studenttable WHERE name LIKE '%${searchName}%' && grade=${searchCategory} `
  }
  else {
    //标准查询的语句(标准查询)
    sql = `select * from studenttable limit ${(page - 1) * pagecell}, ${pagecell}`
    totalsql = `select count(*) from studenttable`
  }
  con.query(sql, (err, data) => {
    if (err) throw err

    con.query(totalsql, (err2, data2) => {
      res.send({
        data: data, //数据数组
        total: data2[0]["count(*)"] //数据总条数
      })

    })


  })



})


//--------------------------删除学生信息-----------------------------//

router.get('/studentdel', function (req, res) {
  let id = req.query.id

  let sql = `DELETE FROM studenttable WHERE id=${id}`
  con.query(sql, (err, data) => {
    if (err) throw err

    res.send('ok')
  })
})




//--------------------------添加学生信息-----------------------------//

router.get('/addstudent', function (req, res) {
  let { name, sex, age, grade, classname, results, studentDesc, contractPrice } = req.query

  var sql = `INSERT INTO studenttable(name, sex, age, grade, classname, results, studentDesc, contractPrice) VALUES('${name}','${sex}',${age},'${grade}','${classname}','${results}','${studentDesc}','${contractPrice}')`
  con.query(sql, (err, data) => {
    if (err) throw err

    res.send('ok')
  })


})






//--------------------------请求学生信息-----------------------------//








//--------------------------请求学生信息-----------------------------//






//--------------------------请求学生信息-----------------------------//




//--------------------------添加管理员账号---------------------------//
router.post('/accountadd', function (req, res) {
  var acc = req.body.acc
  var pwd = req.body.pwd
  var name = req.body.name
  var ug = req.body.ug

  var sql = `INSERT INTO user(account,password,userGroup,name) VALUES('${acc}','${pwd}','${ug}','${name}')`

  con.query(sql, (err, data) => {
    if (err) throw err;

    res.send('ok')  //账号添加成功
  })
});



//----------------------------管理员列---------------------------------//
router.post('/account', function (req, res) {
  var sql = `SELECT * FROM user`

  con.query(sql, (err, data) => {
    if (err) throw err;

    res.send(data)  //请求成功
  })
});


//--------------------------删除管理员-----------------------------//

router.get('/accountdel', function (req, res) {
  let id = req.query.id

  let sql = `DELETE FROM user WHERE id=${id}`
  con.query(sql, (err, data) => {
    if (err) throw err

    res.send('ok')
  })
})


//----------------------------文件上传--------------------------------//

router.post('/upload', function (req, res) {
  var form = new multiparty.Form({ uploadDir: './public/userheaders' });
  //上传完成后处理
  form.parse(req, function (err, fields, files) {
    var obj = {};
    var filesTmp = JSON.stringify(files, null, 2);
    //只要err存在，则表示图片上传失败
    if (err) throw err
    else {
      let path = files.file[0].path //接收到图片PATH
      path = path.replace('public\\', '')
      path = path.replace('\\','/')
     
      console.log(path)
      //保存到user表对应数据的avartarURL

      let sql = `UPDATE user SET avatarUrl='${path}' WHERE account='${req.query.acc}'`
      con.query(sql, (err, data) => {
        if (err) throw err

        //把完整图片地址发送给path
        res.send(path)
      })

    }
  });
})


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
