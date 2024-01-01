
const Orders  = require("../models/Orders")
const {VariantProduct} = require("../models/Product")
const crypto = require('crypto');
const https = require('https');
const axios = require('axios').default // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment
const dayjs = require('dayjs');
const config = {
    app_id: "2554",
    key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
    key2: "	trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};
const paymentController = {
    paymentWithMoMo: async (req, res)=>{
        const { order } = req.body;
        const partnerCode = "MOMO6K0Y20210317";
        const accessKey = "8oZLaYOOTAswDt0O";
        const secretkey = "MHxk2u6eOXitCarGbCsGXmpydjn0wCAk";
        const requestId = partnerCode + new Date().getTime();
        const orderId = requestId;
        const orderInfo = "Thanh toán sản phẩm tại NVH-SHOP";
        const redirectUrl = "http://localhost:3000/";
        const ipnUrl = "http://localhost:5000/v1/orders/create";
        const amount = order.totalPrice;
        const requestType = "captureWallet"
        const extraData = JSON.stringify({ ...order, userId: req.user._id }) + "@"; //pass empty value if your merchant does not have stores
        const rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType
        const signature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
        //json object send to MoMo endpoint
        const body = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            orderObj: order,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'en'
        });
        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }
        var request = await https.request(options, (resp) => {
            resp.setEncoding('utf8');
            resp.on('data', (body) => {
                res.status(200).json({ url: JSON.parse(body).payUrl });
            });
            resp.on('end', () => {
                console.log('No more data in response.');
            });
        });
        request.write(body);
        request.end();
        },
    paymentWithZALO: async(req, res)=>{
        try {
            const embed_data = {};

            const items = [{}];
            const transID = Math.floor(Math.random() * 1000000);
            
            const order = {
                app_id: config.app_id,
                app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
                app_user: req.user.id,
                app_time: Date.now(), // miliseconds
                item: JSON.stringify(items),
                embed_data: JSON.stringify(embed_data),
                amount: 50000,
                description: `HNV-SHOP - Payment for the order #${transID}`,
                bank_code: "zalopayapp",
            };
            
            // appid|app_trans_id|appuser|amount|apptime|embeddata|item
            const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
            order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();
            
            axios.post(config.endpoint, null, { params: order })
                .then(res => {
                    console.log(res.data.order_url);
                })
                .catch(err => console.log(err));  
            
            res.status(200).json({success: "Thanh toán thành công, xin cảm ơn"})
        } catch (error) {
            return res.status(500).json({error: error.message})
        }
    },
    createPaymentUrl: function (req, res, next) {
        var ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        
        // var config = require('config');

    
        
        // var tmnCode = config.get('vnp_TmnCode');
        // var secretKey = config.get('vnp_HashSecret');
        // var vnpUrl = config.get('vnp_Url');
        // var returnUrl = config.get('vnp_ReturnUrl');
        var tmnCode = '48ETI4WI' // Mã website của merchant
        //https://sandbox.vnpayment.vn/merchantv2/Account/AccountDetail.htm
        var secretKey = 'NSQOZEKALZIMUDWUMBSLJDWKLLQEGBFD';
        var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        var returnUrl = "http://localhost:3000/vnpay_return";
        var date = new Date();
    
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        var orderId = req.body.orderId;
        var amount = req.body.amount;
        var bankCode = req.body.bankCode;
        
        var orderInfo = req.body.orderDescription;
        var orderType = req.body.orderType;
        var locale = req.body.language;
        if(locale === null || locale === ''){
            locale = 'vn';
        }
        var currCode = 'VND';
        var vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = orderType;
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if(bankCode !== null && bankCode !== ''){
            vnp_Params['vnp_BankCode'] = bankCode;
        }
    
        vnp_Params = sortObject(vnp_Params);
    
        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");     
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        res.status(200).json({ success: "hieu nv", url: vnpUrl});
        // res.redirect(vnpUrl)
    },

    getVnpayReturn: function (req, res, next) {
        let vnp_Params = req.query;
        console.log(vnp_Params);
    
        let secureHash = vnp_Params['vnp_SecureHash'];
        console.log(secureHash);
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
    
        vnp_Params = sortObject(vnp_Params);
    
        // let config = require('config');
        var tmnCode = '48ETI4WI'
        var secretKey = 'NSQOZEKALZIMUDWUMBSLJDWKLLQEGBFD';
    
        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");     
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        if(secureHash === signed){
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
            console.log(1);
        res.status(200).json({ success: "Lấy kết qủa thanh toán thành công", code: vnp_Params['vnp_ResponseCode']});

        } else{
            console.log(2);
            res.status(500).json({ error: "Lấy kết qủa thanh toán thành công", code: '97'});
        }

    },
    getVnpayIPN: async function (req, res) {

        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];
    
        let orderId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    // let config = require('config');
    let secretKey = 'NSQOZEKALZIMUDWUMBSLJDWKLLQEGBFD';
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    const orderPending = await Orders.findById(orderId)
    

    let paymentStatus = orderPending.status; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó
    
    let checkOrderId = orderId == orderPending._id; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if(secureHash === signed){ //kiểm tra checksum
        if(checkOrderId){
            if(checkAmount){
                if(paymentStatus==999){ //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                    if(rspCode=="00"){
                        //thanh cong
                        //paymentStatus = '1'
                        orderPending.status = 0
                        await orderPending.save()
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                    else {
                        //that bai
                        //paymentStatus = '2'
                        orderPending.status = -1
                        for (const item of orderPending.ordersItems) {
                            const variant = await VariantProduct.findById(item.variant);
                            if (variant) {
                              variant.quantity += item.quantity;
                              await variant.save();
                            }
                          }
                        await orderPending.save()
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                }
                else{
                    res.status(200).json({RspCode: '02', Message: 'This order has been updated to the payment status'})
                }
            }
            else{
                res.status(200).json({RspCode: '04', Message: 'Amount invalid'})
            }
        }       
        else {
            res.status(200).json({RspCode: '01', Message: 'Order not found'})
        }
    }
    else {
        res.status(200).json({RspCode: '97', Message: 'Checksum failed'})
    }
    }
}

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}


module.exports = paymentController