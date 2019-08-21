const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello(name: String): String!
    allProducts: [Product]!
    Product(id: ID): Product
    User(email: String): User
    paginatedProducts(
      pageSize: Int
      after: String
    ):ProductConnection!
    allCompanies: [Company]!
    allSuppliers: [Supplier]!
    allCategories: [Category]!
    getCart: Cart!
  }

  type Mutation{
    signUpUser(input: SignUpInput ): SignUpResponse!
    signInUser(input: SignInInput): String!
    addToCart(input: AddCartInput): AddToCartResponse!
    createProduct(input: createProductInput ): Product!
    createSupplier( input: createSupplierInput): Supplier!
    createCompany(input: normalizedStringInput): Company!
    createCategory(input: normalizedStringInput): Category!
    removeFromCart( cartItemId: ID!):Cart!
    updateCartQuant( cartItemId: ID! , quantity: Int!): CartItem!
  }

  input normalizedStringInput{
    name: String!
  }

  input createSupplierInput{
    name: String!
    code: String!
    gstin: String
  }

  input createProductInput{
    name: String!
    code: String!
    category: String!
    tags: [ID]!
    hsn: String
    variants: [VariantInput]!
    supplier: String!
    company: String!
  }

  input VariantInput{
    name: String!
    price: Int!
    pRate: Float!
    taxType: Float!
    stock: Int!
  
  }


  type ProductConnection{
    cursor: String
    hasMore: Boolean!
    products:[Product]!  
  }

  input SignUpInput{
    email: String!
    name: String!
    password: String!
  }

  input SignInInput{
    email: String!
    password: String!
  }

  input AddCartInput{
    productId: String!
    variantId: String!
    quantity: Int!
  }

  type SignUpResponse{
    token: String!
    user: User
    success: Boolean
  }

  type AddToCartResponse{
    success: Boolean!
    cart: Cart
    msg: String
  }

  type User {
    id: ID! 
    name: String!
    email: String! 
    password: String!
    addresses: [Address]
    cart: Cart
    addnInfo: AddInfo
    orders: [Order]
  }
  
  type Address{
    id: ID! 
    name: String!
    line1: String!
    line2: String
    district: String
    state: String
    pincode: String
    user : User 
  }
  
  type Supplier{
    id: ID! 
    code: String!
    name: String!
    gstin: String
  
  }
  
  type Company{
    id: ID!
    name: String!
  }
  
  type Product{
    id: ID! 
    code: String!
    name: String!
    imageuri: String
    category: Category!
    tags: [Tag]
    hsn: String
    variants: [Variant!]!
    supplier: Supplier!
    company: Company!
  }
  
  type Variant{
    id: ID! 
    name: String!
    price: Int
    pRate: Float
    taxType: Float
    stock: Int
    product: Product 
  }
  
  type Category{
    id: ID! 
    name: String!
  }
  
  type Tag{
    id: ID! 
    name: String!
    search: String!
  }
  
  type Cart{
    id: ID! 
    items: [CartItem]!
    user: User! 
  }
  
  type CartItem{
    id: ID! 
    cart: Cart! 
    product : Product!
    variant: Variant!
    quantity: Int! 
  }
  
  type Order{
    id: ID! 
    user: User! 
    delivered: Boolean! 
    items: [CartItem]!
    amount: Int!
    orderDate: String!
    deliverDate: String
    eta: String
    payment: Payment!
  }
  
  type Payment{
    id: ID! 
    user: User! 
    order: Order! 
    modeOfPayment: String!
    payed: Boolean!
    amount : Int!
  }
  
  type AddInfo{
    id: ID! 
    user: User! 
    nickName: String! 
  }
`

module.exports = typeDefs;