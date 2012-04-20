
db.dropDatabase();
db.users.save(
{
  "_id": 5,
  "email": "pete@petebrumm.com",
  "address": {"addr1": "Test Address", "addr2": "", "city": "", "state": "", "zip": ""}
});

db.categories.save(
{
  "_id": 1,
  "name": "Root Category",
  "depth": 0,
  "path": [],
});
db.categories.save(
{
  "_id": 7,
  "name": "Health",
  "depth": 1,
  "path": [1],
});
db.attributes.save(
{
  "_id": 2,
  "name": "Color",
  "searchable": true,
  "values": [],
  "category_ids": [],
  "val_products": {}
});
db.attributes.save(
{
  "_id": 9,
  "name": "Weight",
  "searchable": true,
  "values": [],
  "category_ids": [],
  "val_products": {}
});
db.attributes.save(
{
  "_id": 10,
  "name": "Height",
  "searchable": true,
  "values": [],
  "category_ids": [],
  "val_products": {}
});
// helper function 
save_prod_and_update_attrs = function(prod){
    // save product
    db.products.save(prod)
    // update other models
    for(var i=0; i< prod.attrs.length; i++) {
      attr = prod.attrs[i]
      set_changes = { "category_ids": {"$each" : prod.category_ids}}
      set_changes['val_products.' + attr.v] = prod["_id"]
      set_changes['values'] = attr.v
      set_changes['product_ids'] = prod['_id']
      db.attributes.update({_id: attr.id}, 
                           {
                             $addToSet: set_changes
                           })
    }
    category = db.categories.find({"_id": prod.category_id})[0]
    path = category.path
    path.push(category['_id'])
    db.categories.update(
      {"_id": {$in: path}}, 
      {
        $addToSet: {
          product_ids: prod['_id'], 
          attribute_ids: { $each: _.map(prod.attrs, function(attr){ return attr.id})}
        }
      },
      false,true
    )

}

save_prod_and_update_attrs({
  "_id": 3,
  "name": "Test Product",
  "category_ids": [1],
  "price": 19.95,
  "currency": "usd",
  'attrs': [
    {"id": 2, "v": "white"},
    {"id": 10, "v": "50"},
  ]
});

save_prod_and_update_attrs({
  "_id": 6,
  "name": "Test Product2",
  "category_ids": [7],
  "price": 19.95,
  "currency": "usd",
  'attrs': [
    {"id": 2, "v": "red"},
    {"id": 9, "v": "15"}
  ]
})
save_prod_and_update_attrs({
  "_id": 8,
  "name": "Test Product3",
  "category_ids": [7],
  "price": 19.95,
  "currency": "usd",
  'attrs': [
    {"id": 2, "v": "red"},
    {"id": 9, "v": "16"}
  ]
})

db.carts.save(
{
  "user_id": 5,
  "status": "open",
  "items": [
    {"product_id": 3, "qty": 1, "name": "Test Product", "price": 19.95, "currency": "usd"}
  ]
});
db.users.ensureIndex({"email": 1});
db.categories.ensureIndex({"path": 1});
db.categories.ensureIndex({"depth": 1});
db.attributes.ensureIndex({"category_ids": 1});
db.products.ensureIndex({"category_ids": 1, "price": 1});
db.products.ensureIndex({"category_ids": 1, "price": -1});
db.carts.ensureIndex({"user_id": 1});
db.carts.ensureIndex({"status": 1});
db.carts.ensureIndex({"items.product_id": 1});
/// Problems with this data model.    
/// 1. value's are placed as hash key's.   can't contain periods or spaces.   Need some other mapping from striped version to full
/// 2. for a lot of products, category and attribute could have lots of product ids.  may need better location

