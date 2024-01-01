
const Collection = require('../models/Collection')
const {Product} = require('../models/Product')

const CollectionController = {
    createCollection: async (req, res) => {
        try {
            const {name, position} = req.body
            const collection = await Collection.findOne({name});
              if (collection) {
                    if (collection.name === name) {
                      return res.status(400).json({ error: "Bộ sưu tập đã tồn tại" });
                    } else{
                      return res.status(400).json({ error: "Thứ tự đã tồn tại" });
                    }
                
              }
            const newCollection = new Collection({
                name, position
            })
            await newCollection.save()
            res.status(200).json({success: "Thêm bộ sưu tập thành công", data: newCollection})
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    },

    updateCollection: async (req, res) => {
        try {
            const {name, position} = req.body
            const _id = req.params.id
            await Collection.findByIdAndUpdate(_id, {name, position})
            res.status(200).json({success: "Cập nhật bộ sưu tập thành công"})
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    },

    deleteOneCollection: async (req, res) => {
        try {
            const _id = req.params.id
            const hasProduct = await Product.exists({collection: _id})
            if(hasProduct) {
                return res.status(400).json({ error: 'Không thể xóa bst đang chứa sản phẩm.' });
            }
            await Collection.deleteOne({_id})
            res.status(200).json({success: "Xóa bộ sưu tập thành công"})
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    },
    getCollectionById: async(req, res)=> {
        try {
            
            const id = req.params.id
            const Collection = await Collection.findById(id)
            res.status(200).json({success: "Lấy sản phẩm thành công", data: Collection})
        } catch (error) {
            res.status(500).json({error: error.message})
            
        }
    },

    getAllCollection: async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 100; // Default limit to 10 if not provided
        const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
        const skip = (page - 1) * limit;
    
        const search = req.query.search || null;
    
        let collections;
        let totalCollections;
    
        if (search) {
            collections = await Collection.find({
                $expr: {
                    $regexMatch: {
                        input: { $getField: 'name' },
                        regex: new RegExp(search, 'i'),
                    },
                },
            })
            totalCollections = await Collection.countDocuments({
                $expr: {
                    $regexMatch: {
                        input: { $getField: 'name' },
                        regex: new RegExp(search, 'i'),
                    },
                },
            });
        } else {
            collections = await Collection.find().skip(skip).limit(limit);
            totalCollections = await Collection.countDocuments();
        }
    
        // const totalPages = Math.ceil(totalCollections / limit);
    
        res.status(200).json({
            success: "Lấy tất cả bộ sưu tập thành công",
            data: collections,
            total: totalCollections,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
      }
}


module.exports = CollectionController