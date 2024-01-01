const {Product, VariantProduct, SizeProduct, ColorProduct} = require('../models/Product')
const Orders = require('../models/Orders')
const dayjs = require('dayjs')
const statisticsController = {
  revenueStatistics: async (req, res) => {
    const { type, dateFrom, dateTo } = req.query;
    console.log(req.query);
    const defaultDateFrom = new Date();
    defaultDateFrom.setMonth(defaultDateFrom.getMonth() - 1); 
    const startDate = dateFrom ? new Date(dateFrom) : defaultDateFrom;
    const endDate = dateTo ? new Date(dateTo) : new Date();

    
    let step = -1;
    if (type == "day") {
        step = 10;
    } else if (type == "month") {
        step = 7;
    } else if (type == "year") {
        step = 4
    }
    if (step === -1) {
        return res.status(400).json({ error: "Type param is invalid" })
    }
    try {
        const revenue = await Orders.aggregate([
            {
              "$match": {
                "createdAt": { "$gte": startDate, "$lte": endDate },
              }
            },
            {
              "$unwind": "$ordersItems"
            },
            {
              "$lookup": {
                "from": "products",
                "localField": "ordersItems.product",
                "foreignField": "_id",
                "as": "productDetails"
              }
            },
            {
              "$unwind": "$productDetails"
            },
            {
              "$group": {
                "_id": {
                  $substr: ['$createdAt', 0, step]
                },
                "totalAmount": { "$sum": { "$multiply": ["$ordersItems.quantity", "$productDetails.price"] } },
                "totalQuantityProduct": { "$sum": "$ordersItems.quantity" },
                "cancelledOrders": {
                  "$sum": {
                    "$cond": { "if": { "$eq": ["$status", -1] }, "then": 1, "else": 0 }
                  }
                },
                "successfulOrders": {
                  "$sum": {
                    "$cond": { "if": { "$in": ["$status", [0, 1, 2, 3]] }, "then": 1, "else": 0 }
                  }
                },
                "totalCancelledAmount": {
                  "$sum": {
                    "$cond": { "if": { "$eq": ["$status", -1] }, "then": { "$multiply": ["$ordersItems.quantity", "$productDetails.price"] }, "else": 0 }
                  }
                },
                "totalSuccessfulAmount": {
                  "$sum": {
                    "$cond": { "if": { "$in": ["$status", [0, 1, 2, 3]] }, "then": { "$multiply": ["$ordersItems.quantity", "$productDetails.price"] }, "else": 0 }
                  }
                },
                // "top5bestselling": {
                //     "$push": {
                //       "orderItem": "$ordersItems",
                //       "product": "$productDetails",
                //       "$sort": { "totalQuantity": -1 }, 
                //       "$limit": 5 
                //     },
                //   }
              }
            },
            {
              "$project": {
                "_id": 0,
                "date": "$_id",
                "totalAmount": "$totalAmount",
                "totalQuantityProduct": "$totalQuantityProduct",
                "cancelledOrders": "$cancelledOrders",
                "successfulOrders": "$successfulOrders",
                "totalCancelledAmount": "$totalCancelledAmount",
                "totalSuccessfulAmount": "$totalSuccessfulAmount",
                // "top5bestselling": 1
              }
            },
            {
              $sort: {
                "date": 1 
              }
            },
            // {
            //   $limit: 5 
            // }
          ]);
        
        if (revenue) {
            return res.status(200).json({ revenue })
        }
        res.status(400).json({ error: "Something went wrong" })
    } catch (error) {
        res.status(400).json({ error })
    }
  },
  hotSellingProductStatistics: async (req, res) => {
    try {
        const hotSellingProduct = await Orders.aggregate([
            {
                $unwind: "$ordersItems" 
            },
            {
                $lookup: {
                  from: "products",
                  localField: "ordersItems.product",
                  foreignField: "_id",
                  as: "productDetails"
                }
              },
            {
                $group: {
                    _id: "$ordersItems.product", 
                    totalQuantity: { $sum: "$ordersItems.quantity" }, 
                    detail: { $first: "$productDetails" }
                }
            },
            {
                $sort: {
                    totalQuantity: -1 
                }
            },
            {
                $limit: 5 
            }
        ])
        if (hotSellingProduct) {
            return res.status(200).json({ hotSellingProduct })
        }
        res.status(400).json({ error: "Something went wrong" })
    } catch (error) {
        
    }
  },
};

module.exports = statisticsController;