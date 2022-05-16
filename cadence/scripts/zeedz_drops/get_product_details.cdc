import ZeedzDrops from "../../contracts/ZeedzDrops.cdc"

pub fun main(productID: UInt64): ZeedzDrops.ProductDetails {   
    let productRef =  ZeedzDrops.getProduct(id: productID) ?? panic("Product with specified id not found")
    return productRef.getDetails()
}