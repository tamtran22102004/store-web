const express = require('express')
const path = require('path');
const app = express();
const port = 5000;
const db = require('./src/config/db.js')
const cors = require('cors')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const verifyToken = require('./src/middleware/auth-middleware.js');
const attachuser = require('./src/middleware/attachuser');

dotenv.config();


//config cors
app.use(cors());
//config static file
app.use(express.static(path.join(__dirname,'public')));
//config ejs
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'src','views'))
//config reqbody
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
//
app.use(attachuser); // ✅ áp dụng middleware toàn cục
//config router
const authrouter = require('./src/router/authrouter.js')
const productrouter = require('./src/router/productrouter.js')
const cartrouter = require('./src/router/cartrouter.js')
const paymentrouter = require('./src/router/paymentrouter.js');
const orderrouter = require('./src/router/orderrouter.js');
// app.use('/', userrouter);
app.use('/', authrouter);
app.use('/api/products', productrouter);
app.use('/api/cart', cartrouter);
app.use('/api/', paymentrouter);
app.use('/api/order',orderrouter);
app.listen(port,()=>{
    console.log(`hệ thống chạy trên cổng ${port}`);
})