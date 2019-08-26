const { prisma } = require('./generated/prisma-client');
const { paginateResults } = require('./utils');
const { createNewUser, createNewSupplier, createNewCategory, createNewCompany } = require('./db-ops');

const resolvers = {
	Query: {
		hello: (_, { name }) => `Hello ${name || 'World'}`,
		allProducts: async (_, __, { prisma }) => {
			const products = await prisma.products();
			return products;
		},
		Product: (_, { id }, { prisma }) => prisma.product({ id: id }),
		User: (_, { email }, { user }) => {
			// console.log("User:", user.name);
			if (user && user.email == email) {
				return prisma.user({ email });
			}
		},
		paginatedProducts: async (_, { pageSize = 20, after }) => {
			// return paginated query based on the cursor
			const allProducts = await prisma.products();

			allProducts.reverse();

			// implement ranking later
			const getCursor = item => {
				return item.id;
			};

			const products = paginateResults({ after, pageSize, results: allProducts, getCursor });

			return {
				products,
				cursor: products.length ? getCursor(products[products.length - 1]) : null,
				hasMore: products.length
					? getCursor(products[products.length - 1]) !== getCursor(allProducts[allProducts.length - 1])
					: false
			};
		},
		allCompanies: async (_, __) => {
			return prisma.companies();
		},
		allSuppliers: async (_, __) => {
			return prisma.suppliers();
		},
		allCategories: () => {
			return prisma.categories();
		},
		getCart: async (_, __, { user }) => {
			// console.log(user)
			return prisma.user({ email: user.email }).cart();
		},
		orders: async (_, __, { user }) => {
			return prisma.user({ id: user.id }).orders();
		},
		address: async (_, __, { user }) => {
			return prisma.user({ id: user.id }).addresses();
		}
	},
	Mutation: {
		async signUpUser(_, { input }) {
			const { email, name, password } = input;
			const user = await prisma.createUser({
				email,
				name,
				password,
				cart: {
					create: {}
				}
			});
			// update token logic here
			const token = user.email;
			return {
				user,
				token,
				success: true
			};
		},
		async signInUser(_, { input }) {
			const { email, password } = input;
			const user = await prisma.user({ email });
			if (user.password === password) {
				return user.email;
			} else {
				return 'Denied';
			}
		},
		async addToCart(_, { input }, { user }) {
			const { productId, variantId, quantity } = input;
			if (!user) return { success: false };

			const userCart = await prisma.user({ id: user.id }).cart();
			const cartItem = await prisma.createCartItem({
				cart: {
					connect: {
						id: userCart.id
					}
				},
				product: {
					connect: {
						id: productId
					}
				},
				variant: {
					connect: {
						id: variantId
					}
				},
				quantity
			});

			const updatedUserCart = await prisma.updateCart({
				data: {
					items: {
						connect: [
							{
								id: cartItem.id
							}
						]
					}
				},
				where: {
					id: userCart.id
				}
			});

			return {
				success: true,
				cart: updatedUserCart
			};
		},

		createProduct: async (_, { input }) => {
			// console.log(input);
			return createNewUser(input);
		},
		createSupplier: async (_, { input }) => {
			return createNewSupplier(input);
		},
		createCompany: async (_, { input }) => {
			return createNewCompany(input);
		},
		createCategory: async (_, { input }) => {
			return createNewCategory(input);
		},
		removeFromCart: async (_, { cartItemId }, { user }) => {
			if (!user) return null;
			await prisma.deleteCartItem({ id: cartItemId });
			return prisma.user({ id: user.id }).cart();
		},
		updateCartQuant: async (_, { cartItemId, quantity }, { user }) => {
			if (!user) return;
			return prisma.updateCartItem({
				data: {
					quantity
				},
				where: {
					id: cartItemId
				}
			});
		},
		createOrder: async (_, { input }, { user }) => {
			if (!user) return;
			const { itemID, address, paymentType } = input;
			// Get items from the cart and check if those belong to the user
			console.log('Item ID display:', itemID);
			const fragment = `
        fragment cartItemWithVariant on CartItem{
          id
          quantity
          variant{
            price
          }
        }
      `;
			const orderFragment = `
       fragment withItemsInOrder on Order{
         id
         orderDate
         delivered
         amount
         eta
         deliverDate
         items{
           id
           variant{
             id
           }
           quantity
         }
       }
      `;
			const items = await prisma.cartItems({ where: { id_in: itemID } }).$fragment(fragment);
			let amount = 0;
			console.log(items);
			items.forEach(item => {
				amount += item.quantity * item.variant.price;
			});
			const order = await prisma
				.createOrder({
					amount,
					deliverDate: '2019-02-04',
					delivered: false,
					items: {
						connect: items.map(item => ({
							id: item.id
						}))
					},
					deliverTo: {
						connect: {
							id: address
						}
					},
					payment: {
						create: {
							payed: paymentType == 'COD' ? false : true,
							modeOfPayment: paymentType,
							user: {
								connect: {
									id: user.id
								}
							},
							amount
						}
					},
					orderDate: '2019-02-01',
					user: {
						connect: {
							id: user.id
						}
					}
				})
				.$fragment(orderFragment);
			console.log('The order is: ', order);

			return prisma.order({ id: order.id });
			// return order;
		},
		addAddress: async (_, { input }, { user }) => {
			const newAddress = await prisma.createAddress({
				...input,
				user: {
					connect: {
						id: user.id
					}
				}
			});
			return newAddress;
		}
	},
	Product: {
		variants(parent, _, { prisma }) {
			return prisma.product({ id: parent.id }).variants();
		},
		company(parent, _, { prisma }) {
			return prisma.product({ id: parent.id }).company();
		},
		category(parent, _, { prisma }) {
			return prisma.product({ id: parent.id }).category();
		},
		tags(parent, _, { prisma }) {
			return prisma.product({ id: parent.id }).tags();
		},
		supplier(parent, _, { prisma }) {
			return prisma.product({ id: parent.id }).supplier();
		}
	},
	User: {
		cart({ id }) {
			return prisma.user({ id }).cart();
		}
	},
	Cart: {
		items({ id }) {
			return prisma.cart({ id }).items();
		}
	},
	CartItem: {
		product({ id }) {
			return prisma.cartItem({ id }).product();
		},
		variant({ id }) {
			return prisma.cartItem({ id }).variant();
		}
	},
	Order: {
		items({ id }) {
			return prisma.order({ id }).items();
		},
		payment({ id }) {
			return prisma.order({ id }).payment();
		}
	}
};

module.exports = resolvers;
