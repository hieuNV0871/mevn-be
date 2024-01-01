
const Category = require('../models/Category')
const {Product} = require('../models/Product')
const categoryController = {
    createCategory: async (req, res) => {
        try {
            const { name, position, parentCategory } = req.body;
            const newCategory = new Category({
              name,
              position,
              parentCategory: parentCategory ? parentCategory : null, 
            });
            await newCategory.save();
            res.status(201).json({ success: 'Thêm mới danh mục thành công', data: newCategory });
          } catch (error) {
            res.status(500).json({error: error.message})
          }
    },

    updateCategory: async (req, res) => {
        try {
            const {name, position, parentCategory} = req.body
            let parentCategoryTmp = parentCategory ? parentCategory : null
            const _id = req.params.id
            await Category.findByIdAndUpdate(_id, {name, position, parentCategory: parentCategoryTmp })
            res.status(200).json({success: "Cập nhật danh mục thành công"})
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    },
    deleteOneCategory: async (req, res) => {
        try {
            const parentId = req.params.id;
            const hasProduct = await Product.exists({category: parentId})
            
            if(hasProduct) {
                return res.status(400).json({ error: 'Không thể xóa danh mục đang chứa sản phẩm.' });
            }
            // Kiểm tra xem có danh mục con không
            const hasSubcategories = await Category.exists({ parentCategory: parentId });
        
            if (hasSubcategories) {
              return res.status(400).json({ error: 'Không thể xóa danh mục cha có danh mục con.' });
            }
        
            // Nếu không có danh mục con, thì tiến hành xóa danh mục cha
            await Category.deleteOne({ _id: parentId });
            res.status(200).json({ success: 'Xóa danh mục thành công' });
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    },
    getCategoryById: async(req, res)=> {
        try {
            const id = req.params.id
            const category = await Category.findById(id)
            res.status(200).json({success: "Lấy danh mục thành công", data: category})
        } catch (error) {
            res.status(500).json({error: error.message})
            
        }
    },
   
    getAllParentCategory: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100; // Default limit to 10 if not provided
            const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
            const skip = (page - 1) * limit;
            const categories = await Category.find({ parentCategory: null }).lean().skip(skip).limit(limit);
            const totalCategories = await Category.countDocuments({ parentCategory: null });
            
            for (const parentCategory of categories) {
                const subcategories = await Category.find({ parentCategory: parentCategory._id }).lean();
                parentCategory.children = subcategories;
            }
        
            res.status(200).json({ success: "Lấy tất cả danh mục cha thành công", data: categories, total: totalCategories });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllSubCategoryByParent: async(req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100; // Default limit to 10 if not provided
            const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
            const skip = (page - 1) * limit;
            const parentId  = req.params.id;  
            const totalSubcategories = await Category.countDocuments({ parentCategory: parentId });

            const subcategories = await Category.find({ parentCategory: parentId }).skip(skip).limit(limit);
            res.status(200).json({ success: "Lấy tất cả danh mục con theo cha thành công", data: subcategories, total: totalSubcategories });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } 
}


module.exports = categoryController