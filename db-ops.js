const { prisma } = require('./generated/prisma-client');

module.exports.createNewUser = (input) => {
  const createProduct = prisma.createProduct({
    code: input.code,
    name: input.name,
    hsn: input.hsn,
    tags: {
      connect: input.tags.map((Id) => ({ id: Id }))
    },
    variants: {
      create: input.variants.map((variant) => {
        return {
          name: variant.name,
          price: variant.price,
          pRate: variant.pRate,
          taxType: variant.taxType,
          stock: variant.stock
        }
      })
    },
    supplier: {
      connect: {
        id: input.supplier
      }
    },
    company: {
      connect: {
        id: input.company
      }
    },
    category: {
      connect: {
        id: input.category
      }
    }

  });
  return createProduct;
}

module.exports.createNewCompany = (input) => {
  return prisma.createCompany({
    name: input.name
  })
}

module.exports.createNewCategory = (input) => {
  return prisma.createCategory({
    name: input.name,
  });
}

module.exports.createNewSupplier = (input) => {
  return prisma.createSupplier({
    gstin: input.gstin,
    code: input.code,
    name: input.name
  })
}