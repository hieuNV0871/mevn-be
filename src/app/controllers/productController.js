const {Product, VariantProduct, SizeProduct, ColorProduct} = require('../models/Product')
const Category = require('../models/Category')
const Brand = require('../models/Brand')

const unorm = require('unorm');

const jsonStringifySafe = require('json-stringify-safe');
const productController = {
    createProduct: async (req, res) => {
        try {
            const {name, description, category,collectionId, brand, price, images, variants} = req.body
            if(price <=0){
                return res.status(400).json({error: "gia phai lon hon 0"})
            }
            const variantProducts = [];
            const product = await Product.findOne({name})
            if(product) return res.status(400).json({error: "Sản phẩm đã tồn tại"})
        const latestProduct = await Product.findOne({}, {}, { sort: { 'createdAt': -1 } });
        let productOrder = 1;
        const cate = await Category.findById(category)

        if (latestProduct) {
            const latestSku = latestProduct.sku;
            const lastOrder = parseInt(latestSku.substring(3, 7), 10);
            productOrder = Math.min(lastOrder + 1, 9999);
            // productOrder = lastOrder + 1;
        }
        const paddedOrder = productOrder.toString().padStart(4, '0');
        const categoryInitial = cate.name
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
        const normalizedCvtCateName = unorm.nfkd(categoryInitial).replace(/[\u0300-\u036F]/g, '');
        const skuProduct = `NVH${paddedOrder}${normalizedCvtCateName}`;
            const newProduct = new Product({
        name,
        sku: skuProduct,
        description,
        category,
        brand,
        collectionId: collectionId ? collectionId : null,
        price,
        images
    })
    await newProduct.save();
    const existingVariants = new Set();
    for (const variant of variants) {
        const size = await SizeProduct.findById(variant.sizeId);
        const color = await ColorProduct.findById(variant.colorId);
        const sku = `${skuProduct}${size.name}${color.name}`;
    
        // const variantKey = `${variant.sizeId}-${variant.colorId}`;
        if (variant.quantity <= 0) {
            return res.status(400).json({ error: `so luong không hợp lệ cho biến thể có size ${size.name} và color ${color.name}` });
        }
        if (!existingVariants.has(sku)) {
            const variantProduct = new VariantProduct({
                productId: newProduct._id,
                sizeId: variant.sizeId,
                colorId: variant.colorId,
                quantity: variant.quantity,
                sku: sku
            });
            variantProducts.push(variantProduct);
            existingVariants.add(sku);
        } else {
            console.log(`Biến thể đã tồn tại cho size ${size.name} và color ${color.name}`);
        }
    }
    // if(existingVariants){
    //     return res.status(400).json({error: "Ton tai bien the trung lap"})
    // }

    
    await VariantProduct.insertMany(variantProducts);
            res.status(200).json({success: "Thêm mới sản phẩm thành công"})
        }catch (error) {
            res.status(500).json({error: error.message})
        }
    },

    updateProduct: async(req, res) => {
        try {
            const { name, description, category, brand, price, collectionId, images, variants } = req.body;
            const productId = req.params.id;
    
            const existingVariants = new Set();
            const variantProducts = [];
            const cate = await Category.findById(category)

            const existingProduct = await Product.findById(productId)
            let skuProduct
            if(category){
                const oldSku = existingProduct.sku.substring(0, 7);
                const categoryInitial = cate.name
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase())
                .join('');
            const normalizedCvtCateName = unorm.nfkd(categoryInitial).replace(/[\u0300-\u036F]/g, '');
            skuProduct = `${oldSku}${normalizedCvtCateName}`;
            }
            // Lấy danh sách biến thể hiện tại của sản phẩm
            const currentVariants = await VariantProduct.find({ productId: productId });
    
            // Đưa các biến thể hiện tại vào set để kiểm tra trùng lặp
            currentVariants.forEach(variant => {
                const variantKey = `${variant.sizeId}-${variant.colorId}`;
                existingVariants.add(variantKey);
            });
            console.log(skuProduct);
            for (const variant of variants) {
                const size = await SizeProduct.findById(variant.sizeId);
                const color = await ColorProduct.findById(variant.colorId);
                const sku = `${skuProduct || existingProduct.sku}${size.name}${color.name}`;
                console.log(sku);
                const variantKey = `${variant.sizeId}-${variant.colorId}`;
    
                if (variant.quantity <= 0) {
                    return res.status(400).json({ error: `Số lượng không hợp lệ cho biến thể có size ${size.name} và color ${color.name}` });
                }
    
                if (!existingVariants.has(variantKey)) {
                    console.log("them moi");
                    const variantProduct = new VariantProduct({
                        productId: productId,
                        sizeId: variant.sizeId,
                        colorId: variant.colorId,
                        quantity: variant.quantity,
                        sku: sku
                    });
    
                    variantProducts.push(variantProduct);
                    existingVariants.add(variantKey);
                } else {
                    await VariantProduct.findOneAndUpdate({ productId: productId,  sizeId: variant.sizeId, colorId: variant.colorId }, { $set: { quantity: variant.quantity, sku } });
                }
            }
    
            // Xóa tất cả các biến thể cũ của sản phẩm trước khi thêm mới
            // await VariantProduct.deleteMany({ productId: productId });
    
            // Thêm các biến thể mới
            await VariantProduct.insertMany(variantProducts);
    
            // Cập nhật thông tin cơ bản của sản phẩm
            await Product.findByIdAndUpdate(productId, {
                name: name,
                sku: skuProduct,
                description: description,
                category: category,
                brand: brand,
                price: price,
                collectionId: collectionId,
                images: images
            });
    
            res.status(200).json({ success: "Cập nhật sản phẩm thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteOneProduct: async (req, res)=>{
        try {
			const _id = req.params.id
            await VariantProduct.deleteMany({ _id });
			const deletedProduct = await Product.findByIdAndDelete(_id);
            if (!deletedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
			return res.status(200).json({ success: 'Xóa thành công'})
		} catch (error) {
			return res.status(500).json({ error: error.message })
		}
    },

    deleteSelectedProduct: async (req, res)=>{
        try {
		    const _ids = req.body
        
        for (const productId of _ids) {
            await VariantProduct.deleteMany({ productId });
        }
        const deletedProducts = await Product.deleteMany({ _id: { $in: _ids } });
        if (deletedProducts.deletedCount === 0) {
            return res.status(404).json({ error: 'No products found for deletion' });
        }
			return res.status(200).json({ success: 'Xóa thành công'})
		} catch (error) {
			return res.status(500).json({ error: error.message })
		}
    },
    // get
    getAllProduct: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;
          const keyword = req.query.keyword || '';
          const startPrice = parseInt(req.query.start)
            const endPrice = parseInt(req.query.end) 
            const brandName = req.query.brandName 
            const category = req.query.category || ''
            const normalizedKeyword = unorm.nfc(keyword);

    // Build the query object for price filtering
    let brandFilter = {};
    if (brandName) {
      const brand = await Brand.findOne({ name: { $regex: new RegExp(brandName, 'i') } });
      if (brand) {
        brandFilter = { brand: brand._id };
      }
    }

    let filters = {}
    // Build the query object for price and brand filtering
    if(startPrice || endPrice || brandName){
        filters = {
          name: { $regex: new RegExp(normalizedKeyword, 'i') },
          price: { $gte: startPrice, $lte: endPrice },
          ...brandFilter
        };
    }

    // Tính total dựa trên sự có hoặc không có từ khóa tìm kiếm và lọc theo giá và tên thương hiệu
    const total = keyword
      ? await Product.countDocuments({
          ...filters
        })
      : await Product.countDocuments(filters);

      let products;
      // Fetch all products without skip and limit if start, end, or brand filter exists
      if (brandName || startPrice || endPrice) {
        products = await Product.find(filters)
          .populate('category', 'name')
          .populate('brand', 'name')
          .populate('collectionId', 'name')
          .skip(skip)
          .limit(limit);
      } else {
          // Fetch products for the specified page and limit
          console.log("all");
        products = await Product.find()
          .populate('category', 'name')
          .populate('brand', 'name')
          .populate('collectionId', 'name')
          .skip(skip)
          .limit(limit);
        //   console.log(products);
      }
  
      
          const transformedProducts = products.map(product => ({
            productId: product._id,
            name: product.name,
            sku: product.sku,
            description: product.description,
            category: product.category ? product.category.name : null,
            brand: product.brand ? product.brand.name : null,
            collectionId: product.collectionId ? product.collectionId.name : null,
            price: product.price,
            images: product.images,
          }));
          console.log(transformedProducts.length);
          res.status(200).json({ success: "Lấy toàn bộ sản phẩm thành công", data: transformedProducts, total });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

    getProductByID: async(req, res) => {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId)
                .populate('category', 'name') 
                .populate('brand', 'name')
                .populate('collectionId', 'name')

    
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            // Now, let's fetch all variants
            const variants = await VariantProduct.find({ productId })
                .populate('sizeId', 'name')
                .populate('colorId', 'name')
            
            res.status(200).json({success: "Lấy sản phẩm thành công", data: {product, variants}})
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getProductBySubCategory: async(req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
            const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
            const skip = (page - 1) * limit;
            const id = req.params.id;
            const category = await Category.findOne({ _id: id });
            if (!category) {
                return res.status(404).json({ message: 'Danh mục không tồn tại' });
            }
            if (!category) {
                return res.status(404).json({ message: 'Danh mục không tồn tại' });
            }
            const products = await Product.find({
                category: category._id
            }).skip(skip).limit(limit);
            
            res.status(200).json({success: "Lấy sản phẩm thành công", data: products})
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    getProductByParentCategory: async(req, res)=>{
        try {
            const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
            const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
            const skip = (page - 1) * limit;
    
            const parentCategoryId = req.params.id;
            const parentCategory = await Category.findOne({ _id: parentCategoryId });
    
            if (!parentCategory) {
                return res.status(404).json({ message: 'Danh mục cha không tồn tại' });
            }
    
            const subCategories = await Category.find({ parentCategory: parentCategory._id });
    
            const totalProducts = await Product.countDocuments({
                category: { $in: [parentCategoryId, ...subCategories.map(sub => sub._id)] }
            });
    
    
            const products = await Product.find({
                category: { $in: [parentCategoryId, ...subCategories.map(sub => sub._id)] }
            })
                .skip(skip)
                .limit(limit);
    
            res.status(200).json({
                success: "Lấy sản phẩm thành công",
                data: products,
                total: totalProducts,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getProductByCategory: async(req, res)=>{
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;
            const id = req.params.id;
        
            // Kiểm tra xem danh mục có phải là danh mục cha không
            const isParentCategory = await Category.findOne({ _id: id, parentCategory: null });
            let query = {};
            if (isParentCategory) {
                // Nếu là danh mục cha, lấy tất cả sản phẩm của các danh mục con
                const subcategories = await Category.find({ parentCategory: id }, '_id');
                const subcategoryIds = subcategories.map(subcategory => subcategory._id);
                query = { category: { $in: [...subcategoryIds, id] } };
            } else {
                // Nếu là danh mục con, chỉ lấy sản phẩm của danh mục đó
                query = { category: id };
            }
        
            const products = await Product.find(query)
                    .populate('category', 'name')
                    .populate('brand', 'name')
                    .populate('collectionId', 'name')
                    .skip(skip)
                    .limit(limit);
            res.status(200).json({ success: "Lấy sản phẩm thành công", data: products });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    searchProduct: async(req, res)=> {
        try {
            const keyword = req.query.keyword;
            const limit = req.query.limit || 100;
            const results = await Product.find({
                name: { $regex: new RegExp(keyword, 'i') }
            }).limit(limit);
            // const variant = VariantProduct.find({
            //     colorId: { $regex: new RegExp(keyword, 'i') }
            // }).populate('colorId', 'name');
            // const safeVariantResults = JSON.parse(jsonStringifySafe(variant));
            res.status(200).json({success: "Lấy sản phẩm thành công", data: results })
          } catch (error) {
            res.status(500).json({ error: error.message })
          }
    },
    getAllColor: async(req, res)=> {
        try {
            const colors = await ColorProduct.find();
            res.status(200).json({success: "Lấy màu thành công", data: colors })
          } catch (error) {
            res.status(500).json({ error: error.message })
          }
    },
    getAllSize: async(req, res)=> {
        try {
            const sizes = await SizeProduct.find();
            res.status(200).json({success: "Lấy size thành công", data: sizes })
          } catch (error) {
            res.status(500).json({ error: error.message })
          }
    },
    getProductByVariant: async(req, res)=> {
        try {
            const _id = req.params.id
            const variant = await VariantProduct.findById(_id)
            .populate('sizeId')
            .populate('colorId')
            res.status(200).json({success: "Lấy sản phẩm thành công", data: variant })
          } catch (error) {
            res.status(500).json({ error: error.message })
          }
    },
    getDetailProductBySku: async(req, res)=>{
        try {
            const { reqSku } = req.body;
            console.log(reqSku);
            let reqSkus = reqSku.map((r) => r.skuCode); // Lấy ra mảng skuCode từ reqSku
            const variants = await VariantProduct.find({ sku: { $in: reqSkus } });
            let products = [];
            let notFoundSkus = [];
            let total = 0;
    
            for (const variant of variants) {
                // Tìm quantity tương ứng với skuCode trong reqSku
                const foundSku = reqSku.find((r) => r.skuCode === variant.sku);
                const quantity = foundSku ? foundSku.quantity : 0;
    
                // Lấy thông tin sản phẩm từ mô hình Product (sử dụng populate để lấy thông tin từ ref)
                const product = await Product.findById(variant.productId).populate('price');
    
                // Tính tổng giá và thêm vào mảng sản phẩm
                const totalPrice = product.price * quantity;
                total += totalPrice; // Cộng vào tổng
    
                products.push({
                    product: variant.productId,
                    variant: variant._id,
                    quantity: quantity,
                    totalPrice: totalPrice,
                });
            }
    
            // Kiểm tra nếu một trong số reqSku không tìm thấy
            reqSkus.forEach((sku) => {
                if (!variants.some((variant) => variant.sku === sku)) {
                    notFoundSkus.push(sku);
                }
            });
    
            if (notFoundSkus.length > 0) {
                return res.status(404).json({
                    error: `Các SKU không tồn tại: ${notFoundSkus.join(", ")}`,
                });
            }
    
            res.status(200).json({ success: "Lấy chi tiết sản phẩm thành công", data: products, total: total });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    

   
}

module.exports = productController