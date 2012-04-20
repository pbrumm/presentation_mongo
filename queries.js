
// Find Categories at second level
// NOTE: set depth to 0 to get root category and see results with more
categories = db.categories.find({depth: 1})
//  For first
first_category = categories[0]
print(first_category.name)
print("product count: " + first_category.product_ids.length)
attributes = db.attributes.find(
				{
					_id: {$in: first_category.attribute_ids},
					product_ids: {$in: first_category.product_ids}
				}
			)
print("relevant attributes:")

// Find relevant attributes
for(var a=0; a<attributes.length(); a++){
	attr = attributes[a];
	print(attr.name)
	val_keys = _.keys(attr.val_products)
	for(var v=0; v< val_keys.length; v++){
		val = val_keys[v]
		prod_ids = attr.val_products[val]
		if(_.difference(first_category.product_ids,  prod_ids).length > 0) {
			print("  " + val)
		}
	}
}


