import ZeedzDrops from 0xZEEDZ_DROPS

pub fun main(productID: UInt64): ZeedzDrops.ProductDetails {   
    let productRef =  ZeedzDrops.getProduct(id: productID) ?? panic("Product with specified id not found")
    return productRef!.getDetails()
}