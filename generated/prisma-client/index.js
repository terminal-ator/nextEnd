"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "Address",
    embedded: false
  },
  {
    name: "Supplier",
    embedded: false
  },
  {
    name: "Company",
    embedded: false
  },
  {
    name: "Product",
    embedded: false
  },
  {
    name: "Variant",
    embedded: false
  },
  {
    name: "Category",
    embedded: false
  },
  {
    name: "Tag",
    embedded: false
  },
  {
    name: "Cart",
    embedded: false
  },
  {
    name: "CartItem",
    embedded: false
  },
  {
    name: "Order",
    embedded: false
  },
  {
    name: "Payment",
    embedded: false
  },
  {
    name: "AddInfo",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `http://localhost:4477`
});
exports.prisma = new exports.Prisma();
